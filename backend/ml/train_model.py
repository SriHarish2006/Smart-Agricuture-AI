"""
Training script for the leaf-disease classification model.

Usage:
    python backend/ml/train_model.py --data-dir /path/to/dataset

Expected dataset layout (standard Keras ImageDataGenerator "flow_from_directory" format):

    dataset/
        Apple_Scab/
            img1.jpg
            img2.jpg
        Apple_Black_Rot/
            ...
        Tomato_Early_Blight/
            ...

Each subfolder name becomes a class label. A public dataset such as
PlantVillage (https://www.kaggle.com/datasets/emmarex/plantdisease) can be
used, restructured into this layout.

This script will:
1. Load and validate the dataset directory
2. Split into training/validation sets
3. Apply preprocessing and augmentation
4. Build an EfficientNetB0 transfer-learning model
5. Train and evaluate it
6. Save the trained model and class-name mapping to backend/../models/

No accuracy numbers are fabricated - only the metrics actually produced by
training on your dataset are reported and used.
"""
import argparse
import json
import sys
from pathlib import Path

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32


def main():
    parser = argparse.ArgumentParser(description="Train the leaf disease classification model.")
    parser.add_argument("--data-dir", type=str, required=True, help="Path to the labeled image dataset directory.")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs.")
    parser.add_argument("--output-dir", type=str, default=None, help="Where to save the trained model (default: project models/ folder).")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if not data_dir.exists() or not data_dir.is_dir():
        print(f"ERROR: dataset directory not found: {data_dir}")
        sys.exit(1)

    class_dirs = sorted([p for p in data_dir.iterdir() if p.is_dir()])
    if len(class_dirs) < 2:
        print("ERROR: dataset must contain at least 2 class subfolders (one per disease/healthy class).")
        sys.exit(1)

    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models
    except ImportError:
        print("ERROR: TensorFlow is not installed. Run: pip install -r backend/requirements.txt")
        sys.exit(1)

    output_dir = Path(args.output_dir) if args.output_dir else Path(__file__).resolve().parent.parent.parent / "models"
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Loading dataset from {data_dir} ...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
    )

    class_names = train_ds.class_names
    print(f"Found {len(class_names)} classes: {class_names}")

    # Preprocessing + augmentation
    preprocess = tf.keras.applications.efficientnet.preprocess_input
    augmentation = models.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
    ])

    def prep_train(x, y):
        x = augmentation(x)
        x = preprocess(x)
        return x, y

    def prep_val(x, y):
        x = preprocess(x)
        return x, y

    train_ds = train_ds.map(prep_train).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(prep_val).prefetch(tf.data.AUTOTUNE)

    # Build model: EfficientNetB0 transfer learning
    base_model = tf.keras.applications.EfficientNetB0(
        include_top=False, weights="imagenet", input_shape=(*IMAGE_SIZE, 3)
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(*IMAGE_SIZE, 3))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(len(class_names), activation="softmax")(x)
    model = models.Model(inputs, outputs)

    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

    print("Training...")
    history = model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)

    val_loss, val_acc = model.evaluate(val_ds)
    print(f"Final validation accuracy: {val_acc:.4f}")
    print(f"Final validation loss: {val_loss:.4f}")

    model_path = output_dir / "leaf_disease_model.keras"
    classes_path = output_dir / "class_names.json"

    model.save(model_path)
    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=2)

    metrics_path = output_dir / "training_metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump({"val_accuracy": val_acc, "val_loss": val_loss, "epochs": args.epochs}, f, indent=2)

    print(f"Saved model to {model_path}")
    print(f"Saved class names to {classes_path}")
    print(f"Saved training metrics to {metrics_path}")


if __name__ == "__main__":
    main()
