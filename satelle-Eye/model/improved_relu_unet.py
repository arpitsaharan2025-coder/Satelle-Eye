import argparse
import os
import tensorflow as tf
from tensorflow.keras import layers, Model

def conv_block(x, filters, dropout=0.0):
    shortcut = layers.Conv2D(filters, 1, padding='same')(x)
    y = layers.Conv2D(filters, 3, padding='same', use_bias=False)(x)
    y = layers.BatchNormalization()(y)
    y = layers.Activation('relu')(y)
    y = layers.Conv2D(filters, 3, padding='same', use_bias=False)(y)
    y = layers.BatchNormalization()(y)
    y = layers.Add()([shortcut, y])
    y = layers.Activation('relu')(y)
    if dropout:
        y = layers.SpatialDropout2D(dropout)(y)
    return y

def attention_gate(skip, gate, filters):
    theta = layers.Conv2D(filters, 1, padding='same')(skip)
    phi = layers.Conv2D(filters, 1, padding='same')(gate)
    merged = layers.Add()([theta, phi])
    merged = layers.Activation('relu')(merged)
    score = layers.Conv2D(1, 1, padding='same', activation='sigmoid')(merged)
    return layers.Multiply()([skip, score])

def build_model(input_channels=4, size=64):
    inputs = layers.Input((size, size, input_channels))
    e1 = conv_block(inputs, 32, 0.05)
    p1 = layers.MaxPooling2D()(e1)
    e2 = conv_block(p1, 64, 0.08)
    p2 = layers.MaxPooling2D()(e2)
    e3 = conv_block(p2, 128, 0.12)
    p3 = layers.MaxPooling2D()(e3)
    e4 = conv_block(p3, 256, 0.15)
    p4 = layers.MaxPooling2D()(e4)
    b = conv_block(p4, 512, 0.2)

    u4 = layers.UpSampling2D(interpolation='bilinear')(b)
    u4 = layers.Concatenate()([u4, attention_gate(e4, u4, 256)])
    d4 = conv_block(u4, 256, 0.12)

    u3 = layers.UpSampling2D(interpolation='bilinear')(d4)
    u3 = layers.Concatenate()([u3, attention_gate(e3, u3, 128)])
    d3 = conv_block(u3, 128, 0.10)

    u2 = layers.UpSampling2D(interpolation='bilinear')(d3)
    u2 = layers.Concatenate()([u2, attention_gate(e2, u2, 64)])
    d2 = conv_block(u2, 64, 0.08)

    u1 = layers.UpSampling2D(interpolation='bilinear')(d2)
    u1 = layers.Concatenate()([u1, attention_gate(e1, u1, 32)])
    d1 = conv_block(u1, 32, 0.05)

    outputs = layers.Conv2D(1, 1, activation='sigmoid', dtype='float32')(d1)
    return Model(inputs, outputs, name='turahalli_residual_attention_unet_64')

def dice_loss(y_true, y_pred, smooth=1.0):
    y_true = tf.cast(y_true, tf.float32)
    y_pred = tf.cast(y_pred, tf.float32)
    axes = (1, 2, 3)
    intersection = tf.reduce_sum(y_true * y_pred, axis=axes)
    denominator = tf.reduce_sum(y_true + y_pred, axis=axes)
    dice = (2.0 * intersection + smooth) / (denominator + smooth)
    return 1.0 - tf.reduce_mean(dice)

def focal_loss(y_true, y_pred, alpha=0.75, gamma=2.0):
    y_true = tf.cast(y_true, tf.float32)
    y_pred = tf.clip_by_value(tf.cast(y_pred, tf.float32), 1e-7, 1.0 - 1e-7)
    p_t = y_true * y_pred + (1.0 - y_true) * (1.0 - y_pred)
    alpha_t = y_true * alpha + (1.0 - y_true) * (1.0 - alpha)
    return -tf.reduce_mean(alpha_t * tf.pow(1.0 - p_t, gamma) * tf.math.log(p_t))

def combined_loss(y_true, y_pred):
    return 0.65 * dice_loss(y_true, y_pred) + 0.35 * focal_loss(y_true, y_pred)

def dice_metric(y_true, y_pred):
    y_true = tf.cast(y_true, tf.float32)
    y_pred = tf.cast(y_pred > 0.5, tf.float32)
    axes = (1, 2, 3)
    intersection = tf.reduce_sum(y_true * y_pred, axis=axes)
    return tf.reduce_mean((2.0 * intersection + 1.0) / (tf.reduce_sum(y_true + y_pred, axis=axes) + 1.0))

def prepare_dataset(x, y, batch_size=32, training=False):
    ds = tf.data.Dataset.from_tensor_slices((x, y))
    if training:
        ds = ds.shuffle(min(len(x), 4096), reshuffle_each_iteration=True)
    ds = ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return ds

def train(x_train, y_train, x_val, y_val, output='relu_unet_turahalli_64.keras', input_channels=4, epochs=80, batch_size=32):
    model = build_model(input_channels=input_channels)
    model.compile(
        optimizer=tf.keras.optimizers.AdamW(learning_rate=2e-4, weight_decay=1e-5),
        loss=combined_loss,
        metrics=[dice_metric, tf.keras.metrics.BinaryIoU(target_class_ids=[1], threshold=0.5)]
    )
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(output, monitor='val_dice_metric', mode='max', save_best_only=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=6, min_lr=1e-6),
        tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=14, restore_best_weights=True),
        tf.keras.callbacks.CSVLogger('training_history.csv')
    ]
    return model.fit(
        prepare_dataset(x_train, y_train, batch_size, True),
        validation_data=prepare_dataset(x_val, y_val, batch_size, False),
        epochs=epochs,
        callbacks=callbacks
    )

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--channels', type=int, default=4)
    parser.add_argument('--size', type=int, default=64)
    parser.add_argument('--output', default='relu_unet_turahalli_64.keras')
    args = parser.parse_args()
    model = build_model(args.channels, args.size)
    model.summary()
    model.save(args.output)
