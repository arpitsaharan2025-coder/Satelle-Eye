from pathlib import Path
import argparse
import numpy as np
import tensorflow as tf
from PIL import Image

from landcover_multiclass import build_multiclass_unet, compile_model

IMAGE_SIZE = 64
NUM_CLASSES = 6


def load_pairs(image_dir, mask_dir):
    image_paths = sorted(Path(image_dir).glob("*"))
    pairs = []
    for image_path in image_paths:
        mask_path = Path(mask_dir) / f"{image_path.stem}.png"
        if mask_path.exists():
            pairs.append((image_path, mask_path))
    if not pairs:
        raise FileNotFoundError("No matching image/mask pairs found.")
    return pairs


def load_arrays(pairs):
    images = []
    masks = []
    for image_path, mask_path in pairs:
        image = Image.open(image_path).convert("RGB").resize((IMAGE_SIZE, IMAGE_SIZE))
        mask = Image.open(mask_path).convert("L").resize((IMAGE_SIZE, IMAGE_SIZE), Image.Resampling.NEAREST)
        images.append(np.asarray(image, dtype=np.float32) / 255.0)
        masks.append(np.asarray(mask, dtype=np.int32))
    x = np.stack(images)
    y = np.stack(masks)[..., None]
    if y.min() < 0 or y.max() >= NUM_CLASSES:
        raise ValueError(f"Mask values must be integers from 0 to {NUM_CLASSES - 1}.")
    return x, y


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--images", default="data/images")
    parser.add_argument("--masks", default="data/masks")
    parser.add_argument("--output", default="model/landcover_multiclass_64.keras")
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--validation-split", type=float, default=0.2)
    args = parser.parse_args()

    pairs = load_pairs(args.images, args.masks)
    x, y = load_arrays(pairs)

    model = compile_model(build_multiclass_unet())
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            args.output,
            monitor="val_pixel_accuracy",
            save_best_only=True,
            mode="max",
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_pixel_accuracy",
            patience=12,
            restore_best_weights=True,
            mode="max",
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            patience=5,
            factor=0.5,
            min_lr=1e-6,
        ),
    ]

    model.fit(
        x,
        y,
        validation_split=args.validation_split,
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=callbacks,
        shuffle=True,
    )
    print(f"Saved trained model to {args.output}")


if __name__ == "__main__":
    main()
