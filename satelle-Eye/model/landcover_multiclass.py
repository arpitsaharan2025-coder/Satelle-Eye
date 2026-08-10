import tensorflow as tf
from tensorflow.keras import Model, layers

CLASS_NAMES = [
    "Background / Unknown",
    "River / Water Body",
    "Vegetation / Forest",
    "Urban / Built-up Area",
    "Bare Land / Soil",
    "Cloud / Haze",
]

NUM_CLASSES = len(CLASS_NAMES)
IMAGE_SIZE = 64
CHANNELS = 3


def block(x, filters):
    x = layers.Conv2D(filters, 3, padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.ReLU()(x)
    x = layers.Conv2D(filters, 3, padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    return layers.ReLU()(x)


def build_multiclass_unet(
    channels=CHANNELS,
    size=IMAGE_SIZE,
    classes=NUM_CLASSES,
):
    inputs = layers.Input((size, size, channels))
    e1 = block(inputs, 32)
    p1 = layers.MaxPooling2D()(e1)
    e2 = block(p1, 64)
    p2 = layers.MaxPooling2D()(e2)
    e3 = block(p2, 128)
    p3 = layers.MaxPooling2D()(e3)
    bottleneck = block(p3, 256)

    u3 = layers.UpSampling2D(interpolation="bilinear")(bottleneck)
    u3 = layers.Concatenate()([u3, e3])
    d3 = block(u3, 128)

    u2 = layers.UpSampling2D(interpolation="bilinear")(d3)
    u2 = layers.Concatenate()([u2, e2])
    d2 = block(u2, 64)

    u1 = layers.UpSampling2D(interpolation="bilinear")(d2)
    u1 = layers.Concatenate()([u1, e1])
    d1 = block(u1, 32)

    outputs = layers.Conv2D(classes, 1, activation="softmax", dtype="float32")(d1)
    return Model(inputs, outputs, name="satell_eye_multiclass_unet_64")


def compile_model(model):
    model.compile(
        optimizer=tf.keras.optimizers.AdamW(learning_rate=2e-4, weight_decay=1e-5),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=[tf.keras.metrics.SparseCategoricalAccuracy(name="pixel_accuracy")],
    )
    return model
