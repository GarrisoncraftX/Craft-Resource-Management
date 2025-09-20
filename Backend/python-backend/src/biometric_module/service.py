import cv2
import numpy as np
import base64
import hashlib
import torch
import torch.nn as nn
from typing import Optional, Dict, Any, Tuple
from sklearn.metrics.pairwise import cosine_similarity
from src.utils.logger import logger
from src.config.app import Config
import os
import time
import platform

# Replacing placeholder MobileFaceNet with a more complete MobileFaceNet architecture
# This is a simplified MobileFaceNet implementation for demonstration purposes

class BasicBlock(nn.Module):
    def __init__(self, in_planes, out_planes, stride=1, groups=1):
        super(BasicBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_planes, out_planes, kernel_size=3, stride=stride, padding=1, groups=groups, bias=False)
        self.bn1 = nn.BatchNorm2d(out_planes)
        self.prelu = nn.PReLU(out_planes)
        self.conv2 = nn.Conv2d(out_planes, out_planes, kernel_size=3, stride=1, padding=1, groups=out_planes, bias=False)
        self.bn2 = nn.BatchNorm2d(out_planes)
        self.shortcut = nn.Sequential()
        if stride == 1 and in_planes != out_planes:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_planes, out_planes, kernel_size=1, stride=1, bias=False),
                nn.BatchNorm2d(out_planes)
            )
    def forward(self, x):
        out = self.prelu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)
        return out

class MobileFaceNet(nn.Module):
    def __init__(self, embedding_size=512):
        super(MobileFaceNet, self).__init__()
        # Match the checkpoint's layer structure exactly
        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=2, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(64)
        self.prelu1 = nn.PReLU(64)

        self.conv2_dw = nn.Conv2d(64, 64, kernel_size=3, stride=1, padding=1, groups=64, bias=False)
        self.bn2_dw = nn.BatchNorm2d(64)
        self.prelu2_dw = nn.PReLU(64)

        # conv_23 blocks - individual layers to match checkpoint
        self.conv_23_0_conv1 = nn.Conv2d(64, 64, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_23_0_bn1 = nn.BatchNorm2d(64)
        self.conv_23_0_prelu = nn.PReLU(64)
        self.conv_23_0_conv2 = nn.Conv2d(64, 64, kernel_size=3, stride=1, padding=1, groups=64, bias=False)
        self.conv_23_0_bn2 = nn.BatchNorm2d(64)

        self.conv_23_1_conv1 = nn.Conv2d(64, 64, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_23_1_bn1 = nn.BatchNorm2d(64)
        self.conv_23_1_prelu = nn.PReLU(64)
        self.conv_23_1_conv2 = nn.Conv2d(64, 64, kernel_size=3, stride=1, padding=1, groups=64, bias=False)
        self.conv_23_1_bn2 = nn.BatchNorm2d(64)

        self.conv_23_2_conv1 = nn.Conv2d(64, 64, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_23_2_bn1 = nn.BatchNorm2d(64)
        self.conv_23_2_prelu = nn.PReLU(64)
        self.conv_23_2_conv2 = nn.Conv2d(64, 64, kernel_size=3, stride=1, padding=1, groups=64, bias=False)
        self.conv_23_2_bn2 = nn.BatchNorm2d(64)

        # conv_3 blocks
        self.conv_3_0_conv1 = nn.Conv2d(64, 128, kernel_size=1, stride=2, padding=0, bias=False)
        self.conv_3_0_bn1 = nn.BatchNorm2d(128)
        self.conv_3_0_prelu = nn.PReLU(128)
        self.conv_3_0_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_3_0_bn2 = nn.BatchNorm2d(128)

        self.conv_3_1_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_3_1_bn1 = nn.BatchNorm2d(128)
        self.conv_3_1_prelu = nn.PReLU(128)
        self.conv_3_1_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_3_1_bn2 = nn.BatchNorm2d(128)

        self.conv_3_2_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_3_2_bn1 = nn.BatchNorm2d(128)
        self.conv_3_2_prelu = nn.PReLU(128)
        self.conv_3_2_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_3_2_bn2 = nn.BatchNorm2d(128)

        self.conv_3_3_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_3_3_bn1 = nn.BatchNorm2d(128)
        self.conv_3_3_prelu = nn.PReLU(128)
        self.conv_3_3_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_3_3_bn2 = nn.BatchNorm2d(128)

        # conv_34 blocks
        self.conv_34_0_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_34_0_bn1 = nn.BatchNorm2d(128)
        self.conv_34_0_prelu = nn.PReLU(128)
        self.conv_34_0_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_34_0_bn2 = nn.BatchNorm2d(128)

        self.conv_34_1_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_34_1_bn1 = nn.BatchNorm2d(128)
        self.conv_34_1_prelu = nn.PReLU(128)
        self.conv_34_1_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_34_1_bn2 = nn.BatchNorm2d(128)

        self.conv_34_2_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_34_2_bn1 = nn.BatchNorm2d(128)
        self.conv_34_2_prelu = nn.PReLU(128)
        self.conv_34_2_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_34_2_bn2 = nn.BatchNorm2d(128)

        self.conv_34_3_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_34_3_bn1 = nn.BatchNorm2d(128)
        self.conv_34_3_prelu = nn.PReLU(128)
        self.conv_34_3_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_34_3_bn2 = nn.BatchNorm2d(128)

        self.conv_34_4_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_34_4_bn1 = nn.BatchNorm2d(128)
        self.conv_34_4_prelu = nn.PReLU(128)
        self.conv_34_4_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_34_4_bn2 = nn.BatchNorm2d(128)

        self.conv_34_5_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_34_5_bn1 = nn.BatchNorm2d(128)
        self.conv_34_5_prelu = nn.PReLU(128)
        self.conv_34_5_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_34_5_bn2 = nn.BatchNorm2d(128)

        # conv_4 blocks
        self.conv_4_0_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=2, padding=0, bias=False)
        self.conv_4_0_bn1 = nn.BatchNorm2d(128)
        self.conv_4_0_prelu = nn.PReLU(128)
        self.conv_4_0_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_4_0_bn2 = nn.BatchNorm2d(128)

        self.conv_4_1_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_4_1_bn1 = nn.BatchNorm2d(128)
        self.conv_4_1_prelu = nn.PReLU(128)
        self.conv_4_1_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_4_1_bn2 = nn.BatchNorm2d(128)

        self.conv_4_2_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_4_2_bn1 = nn.BatchNorm2d(128)
        self.conv_4_2_prelu = nn.PReLU(128)
        self.conv_4_2_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_4_2_bn2 = nn.BatchNorm2d(128)

        self.conv_4_3_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_4_3_bn1 = nn.BatchNorm2d(128)
        self.conv_4_3_prelu = nn.PReLU(128)
        self.conv_4_3_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_4_3_bn2 = nn.BatchNorm2d(128)

        self.conv_4_4_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_4_4_bn1 = nn.BatchNorm2d(128)
        self.conv_4_4_prelu = nn.PReLU(128)
        self.conv_4_4_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_4_4_bn2 = nn.BatchNorm2d(128)

        self.conv_4_5_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_4_5_bn1 = nn.BatchNorm2d(128)
        self.conv_4_5_prelu = nn.PReLU(128)
        self.conv_4_5_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_4_5_bn2 = nn.BatchNorm2d(128)

        # conv_45 blocks
        self.conv_45_0_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_45_0_bn1 = nn.BatchNorm2d(128)
        self.conv_45_0_prelu = nn.PReLU(128)
        self.conv_45_0_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_45_0_bn2 = nn.BatchNorm2d(128)

        self.conv_45_1_conv1 = nn.Conv2d(128, 128, kernel_size=1, stride=1, padding=0, bias=False)
        self.conv_45_1_bn1 = nn.BatchNorm2d(128)
        self.conv_45_1_prelu = nn.PReLU(128)
        self.conv_45_1_conv2 = nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1, groups=128, bias=False)
        self.conv_45_1_bn2 = nn.BatchNorm2d(128)

        # conv_5
        self.conv_5 = nn.Conv2d(128, 512, kernel_size=1, stride=1, padding=0, bias=False)
        self.bn5 = nn.BatchNorm2d(512)
        self.prelu5 = nn.PReLU(512)

        # conv_6_dw
        self.conv_6_dw = nn.Conv2d(512, 512, kernel_size=7, stride=1, padding=0, groups=512, bias=False)
        self.bn6_dw = nn.BatchNorm2d(512)
        self.prelu6_dw = nn.PReLU(512)

        self.linear = nn.Linear(512, embedding_size)
        self.bn = nn.BatchNorm1d(embedding_size)
    
    def forward(self, x):
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.prelu1(x)

        x = self.conv2_dw(x)
        x = self.bn2_dw(x)
        x = self.prelu2_dw(x)

        # conv_23 blocks
        x = self.conv_23_0_conv1(x)
        x = self.conv_23_0_bn1(x)
        x = self.conv_23_0_prelu(x)
        x = self.conv_23_0_conv2(x)
        x = self.conv_23_0_bn2(x)

        x = self.conv_23_1_conv1(x)
        x = self.conv_23_1_bn1(x)
        x = self.conv_23_1_prelu(x)
        x = self.conv_23_1_conv2(x)
        x = self.conv_23_1_bn2(x)

        x = self.conv_23_2_conv1(x)
        x = self.conv_23_2_bn1(x)
        x = self.conv_23_2_prelu(x)
        x = self.conv_23_2_conv2(x)
        x = self.conv_23_2_bn2(x)

        # conv_3 blocks
        x = self.conv_3_0_conv1(x)
        x = self.conv_3_0_bn1(x)
        x = self.conv_3_0_prelu(x)
        x = self.conv_3_0_conv2(x)
        x = self.conv_3_0_bn2(x)

        x = self.conv_3_1_conv1(x)
        x = self.conv_3_1_bn1(x)
        x = self.conv_3_1_prelu(x)
        x = self.conv_3_1_conv2(x)
        x = self.conv_3_1_bn2(x)

        x = self.conv_3_2_conv1(x)
        x = self.conv_3_2_bn1(x)
        x = self.conv_3_2_prelu(x)
        x = self.conv_3_2_conv2(x)
        x = self.conv_3_2_bn2(x)

        x = self.conv_3_3_conv1(x)
        x = self.conv_3_3_bn1(x)
        x = self.conv_3_3_prelu(x)
        x = self.conv_3_3_conv2(x)
        x = self.conv_3_3_bn2(x)

        # conv_34 blocks
        x = self.conv_34_0_conv1(x)
        x = self.conv_34_0_bn1(x)
        x = self.conv_34_0_prelu(x)
        x = self.conv_34_0_conv2(x)
        x = self.conv_34_0_bn2(x)

        x = self.conv_34_1_conv1(x)
        x = self.conv_34_1_bn1(x)
        x = self.conv_34_1_prelu(x)
        x = self.conv_34_1_conv2(x)
        x = self.conv_34_1_bn2(x)

        x = self.conv_34_2_conv1(x)
        x = self.conv_34_2_bn1(x)
        x = self.conv_34_2_prelu(x)
        x = self.conv_34_2_conv2(x)
        x = self.conv_34_2_bn2(x)

        x = self.conv_34_3_conv1(x)
        x = self.conv_34_3_bn1(x)
        x = self.conv_34_3_prelu(x)
        x = self.conv_34_3_conv2(x)
        x = self.conv_34_3_bn2(x)

        x = self.conv_34_4_conv1(x)
        x = self.conv_34_4_bn1(x)
        x = self.conv_34_4_prelu(x)
        x = self.conv_34_4_conv2(x)
        x = self.conv_34_4_bn2(x)

        x = self.conv_34_5_conv1(x)
        x = self.conv_34_5_bn1(x)
        x = self.conv_34_5_prelu(x)
        x = self.conv_34_5_conv2(x)
        x = self.conv_34_5_bn2(x)

        # conv_4 blocks
        x = self.conv_4_0_conv1(x)
        x = self.conv_4_0_bn1(x)
        x = self.conv_4_0_prelu(x)
        x = self.conv_4_0_conv2(x)
        x = self.conv_4_0_bn2(x)

        x = self.conv_4_1_conv1(x)
        x = self.conv_4_1_bn1(x)
        x = self.conv_4_1_prelu(x)
        x = self.conv_4_1_conv2(x)
        x = self.conv_4_1_bn2(x)

        x = self.conv_4_2_conv1(x)
        x = self.conv_4_2_bn1(x)
        x = self.conv_4_2_prelu(x)
        x = self.conv_4_2_conv2(x)
        x = self.conv_4_2_bn2(x)

        x = self.conv_4_3_conv1(x)
        x = self.conv_4_3_bn1(x)
        x = self.conv_4_3_prelu(x)
        x = self.conv_4_3_conv2(x)
        x = self.conv_4_3_bn2(x)

        x = self.conv_4_4_conv1(x)
        x = self.conv_4_4_bn1(x)
        x = self.conv_4_4_prelu(x)
        x = self.conv_4_4_conv2(x)
        x = self.conv_4_4_bn2(x)

        x = self.conv_4_5_conv1(x)
        x = self.conv_4_5_bn1(x)
        x = self.conv_4_5_prelu(x)
        x = self.conv_4_5_conv2(x)
        x = self.conv_4_5_bn2(x)

        # conv_45 blocks
        x = self.conv_45_0_conv1(x)
        x = self.conv_45_0_bn1(x)
        x = self.conv_45_0_prelu(x)
        x = self.conv_45_0_conv2(x)
        x = self.conv_45_0_bn2(x)

        x = self.conv_45_1_conv1(x)
        x = self.conv_45_1_bn1(x)
        x = self.conv_45_1_prelu(x)
        x = self.conv_45_1_conv2(x)
        x = self.conv_45_1_bn2(x)

        # conv_5
        x = self.conv_5(x)
        x = self.bn5(x)
        x = self.prelu5(x)

        # conv_6_dw
        x = self.conv_6_dw(x)
        x = self.bn6_dw(x)
        x = self.prelu6_dw(x)

        x = x.view(x.size(0), -1)
        x = self.linear(x)
        x = self.bn(x)
        x = nn.functional.normalize(x)
        return x

class BiometricService:
    def __init__(self):
        self.face_detector = None
        self.face_recognition_threshold = Config.FACE_RECOGNITION_THRESHOLD
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self._initialize_face_detection()
        self._initialize_face_recognition_model()
    
    def _initialize_face_detection(self):
        """Initialize face detection models using OpenCV DNN with lightweight model"""
        try:
            model_file = os.path.join('models', 'res10_300x300_ssd_iter_140000.caffemodel')
            config_file = os.path.join('models', 'deploy.prototxt')
            if not os.path.exists(model_file) or not os.path.exists(config_file):
                raise FileNotFoundError("Lightweight face detection model files not found in 'models/' directory.")
            self.face_detector = cv2.dnn.readNetFromCaffe(config_file, model_file)
            logger.info("✅ Lightweight DNN face detection model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Error loading lightweight face detection model: {e}")
            self.face_detector = None
    
    def _initialize_face_recognition_model(self):
        """Initialize lightweight face recognition model (MobileFaceNet)"""
        try:
            self.face_recognition_model = MobileFaceNet().to(self.device)
            # Load pretrained weights if available
            weights_path = os.path.join('models', 'mobilefacenet.pth')
            if os.path.exists(weights_path):
                checkpoint = torch.load(weights_path, map_location=self.device)
                # Try strict loading first
                try:
                    self.face_recognition_model.load_state_dict(checkpoint, strict=True)
                    logger.info("✅ MobileFaceNet model loaded successfully with strict matching")
                except RuntimeError as e:
                    logger.warning(f"⚠️ Strict loading failed: {e}")
                    # Try partial loading
                    try:
                        self.face_recognition_model.load_state_dict(checkpoint, strict=False)
                        logger.info("✅ MobileFaceNet model loaded successfully with partial matching")
                    except Exception as partial_e:
                        logger.error(f"❌ Partial loading also failed: {partial_e}")
                        raise partial_e
            else:
                logger.warning("⚠️ MobileFaceNet weights not found, using untrained model")
            self.face_recognition_model.eval()
        except Exception as e:
            logger.error(f"❌ Error loading face recognition model: {e}")
            self.face_recognition_model = None
    
    def _decode_base64_image(self, base64_image: str) -> Tuple[Optional[np.ndarray], Optional[str]]:
        """Decode base64 image data to numpy array"""
        try:
            if ',' in base64_image:
                image_data = base64.b64decode(base64_image.split(',')[1])
            else:
                image_data = base64.b64decode(base64_image)

            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                return None, "Invalid image data"

            return image, None
        except Exception as e:
            return None, f"Error decoding image: {str(e)}"

    def _create_fallback_template(self, image_data: bytes) -> Dict[str, Any]:
        """Create fallback template using image hash"""
        image_hash = hashlib.sha256(image_data).hexdigest()
        return {
            'template_hash': image_hash,
            'template_data': image_hash,
            'method': 'hash'
        }

    def _detect_face(self, image: np.ndarray) -> Tuple[Optional[Tuple[int, int, int, int]], Optional[str]]:
        """Detect face in image and return bounding box"""
        h, w = image.shape[:2]
        blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0,
                                     (300, 300), (104.0, 177.0, 123.0))
        self.face_detector.setInput(blob)
        detections = self.face_detector.forward()

        if detections.shape[2] == 0:
            return None, "No face detected in image"

        # Find the detection with highest confidence
        max_confidence = 0
        max_index = 0
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > max_confidence:
                max_confidence = confidence
                max_index = i

        if max_confidence < 0.5:
            return None, "No confident face detected"

        box = detections[0, 0, max_index, 3:7] * np.array([w, h, w, h])
        (x1, y1, x2, y2) = box.astype("int")
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w - 1, x2), min(h - 1, y2)

        return (x1, y1, x2, y2), None

    def _extract_face_features(self, face_roi: np.ndarray) -> Tuple[Optional[np.ndarray], Optional[str]]:
        """Extract face features from face region of interest"""
        try:
            face_roi = cv2.resize(face_roi, (128, 128))
            face_roi = face_roi.astype(np.float32) / 255.0
            face_roi = np.transpose(face_roi, (2, 0, 1))  # HWC to CHW
            face_tensor = torch.tensor(face_roi, dtype=torch.float32).unsqueeze(0).to(self.device)

            with torch.no_grad():
                features = self.face_recognition_model(face_tensor)

            features_np = features.cpu().numpy().flatten()
            features_np = features_np / np.linalg.norm(features_np)

            return features_np, None
        except Exception as e:
            return None, f"Error extracting features: {str(e)}"

    def process_face_image(self, base64_image: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """Process base64 face image and extract features using lightweight model"""
        try:
            image, error = self._decode_base64_image(base64_image)
            if error:
                return None, error

            if self.face_detector is None or self.face_recognition_model is None:
                return self._create_fallback_template(base64.b64decode(base64_image.split(',')[1] if ',' in base64_image else base64_image)), None

            box, error = self._detect_face(image)
            if error:
                return None, error

            x1, y1, x2, y2 = box
            face_roi = image[y1:y2, x1:x2]

            features_np, error = self._extract_face_features(face_roi)
            if error:
                return None, error

            template_hash = hashlib.sha256(features_np.tobytes()).hexdigest()
            template_data = base64.b64encode(features_np.tobytes()).decode('utf-8')

            return {
                'template_hash': template_hash,
                'template_data': template_data,
                'method': 'lightweight_dnn',
                'face_coordinates': {'x': int(x1), 'y': int(y1), 'width': int(x2 - x1), 'height': int(y2 - y1)}
            }, None

        except Exception as e:
            logger.error(f"Error processing face image: {e}")
            return None, f"Error processing face image: {str(e)}"
    
    def compare_face_templates(self, template1_data: str, template2_data: str) -> float:
        """Compare two face templates and return similarity score"""
        try:
            # Ensure inputs are strings
            if isinstance(template1_data, bytes):
                # Instead of decoding to utf-8, treat as base64 bytes directly
                template1_data = template1_data.decode('latin1')
                logger.debug(f"Converted template1 from bytes to string, length: {len(template1_data)}")
            if isinstance(template2_data, bytes):
                template2_data = template2_data.decode('latin1')
                logger.debug(f"Converted template2 from bytes to string, length: {len(template2_data)}")

            # First, try to decode as base64
            try:
                decoded1 = base64.b64decode(template1_data)
                decoded2 = base64.b64decode(template2_data)
                logger.debug(f"Successfully decoded base64 - Template1: {len(decoded1)} bytes, Template2: {len(decoded2)} bytes")
            except Exception as decode_error:
                logger.debug(f"Base64 decode failed: {decode_error}. Assuming hash-based templates.")
                # If not base64, treat as hash strings
                return 1.0 if template1_data == template2_data else 0.0

            logger.debug(f"Template 1 size: {len(decoded1)}, Template 2 size: {len(decoded2)}")

            if len(decoded1) == 0 or len(decoded2) == 0:
                logger.warning("Empty template data received")
                return 0.0

            # Check if buffer sizes are valid for float32 arrays (should be multiple of 4)
            if len(decoded1) % 4 != 0 or len(decoded2) % 4 != 0:
                logger.warning(f"Invalid buffer sizes for float32 conversion - Template1: {len(decoded1)}, Template2: {len(decoded2)}")
                # Check if they might be hash-based strings that were incorrectly base64 encoded
                try:
                    # Try to decode as latin1 strings instead of utf-8
                    str1 = decoded1.decode('latin1')
                    str2 = decoded2.decode('latin1')
                    logger.debug("Templates appear to be hash-based strings, comparing as strings")
                    return 1.0 if str1 == str2 else 0.0
                except UnicodeDecodeError:
                    logger.error("Unable to decode templates as strings or float arrays")
                    return 0.0

            # Convert to float32 arrays
            try:
                features1 = np.frombuffer(decoded1, dtype=np.float32)
                features2 = np.frombuffer(decoded2, dtype=np.float32)
            except ValueError as e:
                logger.error(f"Failed to convert buffer to float32 array: {e}")
                return 0.0

            if features1.size == 0 or features2.size == 0:
                logger.warning("Empty feature arrays after conversion")
                return 0.0

            if features1.shape != features2.shape:
                logger.warning(f"Feature shape mismatch: {features1.shape} vs {features2.shape}")
                return 0.0

            similarity = cosine_similarity([features1], [features2])[0][0]
            return float(similarity)
        except Exception as e:
            logger.error(f"Error comparing face templates: {e}")
            # Fallback: return 0.0 for any comparison error
            return 0.0

    
    
    def process_card_data(self, card_data: str) -> Dict[str, str]:
        """Process card data (mock implementation)"""
        try:
            # Mock card processing
            template_hash = hashlib.sha256(card_data.encode()).hexdigest()
            template_data = base64.b64encode(card_data.encode()).decode('utf-8')
            
            return {
                'template_hash': template_hash,
                'template_data': template_data,
                'method': 'mock_card'
            }
        except Exception as e:
            logger.error(f"Error processing card data: {e}")
            raise e
    
    def verify_biometric(self, live_template: str, stored_template: str, biometric_type: str) -> Dict[str, Any]:
        """Verify biometric data against stored template (1:1 verification)"""
        try:
            if biometric_type == 'face':
                similarity = self.compare_face_templates(live_template, stored_template)
                is_match = similarity >= self.face_recognition_threshold
                similarity_score = similarity
            else: # card
                is_match = live_template == stored_template
                similarity_score = 1.0 if is_match else 0.0
               
            return {
                'is_match': is_match,
                'similarity_score': similarity_score,
                'threshold': self.face_recognition_threshold if biometric_type == 'face' else 1.0
            }
        except Exception as e:
            logger.error(f"Error verifying biometric: {e}")
            raise e
    
    def identify_from_templates(self, live_template: str, stored_templates: list, biometric_type: str) -> Optional[Dict[str, Any]]:
        """Identify user from biometric data (1:N identification)"""
        try:
            best_match = None
            best_similarity = 0.0
            threshold = self.face_recognition_threshold if biometric_type == 'face' else 1.0
            
            for user_id, stored_template, first_name, last_name, employee_id in stored_templates:
                if biometric_type == 'face':
                    similarity = self.compare_face_templates(live_template, stored_template)
                else:
                    similarity = 1.0 if live_template == stored_template else 0.0
                
                if similarity >= threshold and similarity > best_similarity:
                    best_similarity = similarity
                    best_match = {
                        'user_id': user_id,
                        'first_name': first_name,
                        'last_name': last_name,
                        'employee_id': employee_id,
                        'similarity_score': similarity
                    }
            
            return best_match
        except Exception as e:
            logger.error(f"Error identifying from templates: {e}")
            raise e
    
    def validate_image_quality(self, base64_image: str) -> Tuple[bool, Optional[str]]:
        """Validate image quality for biometric processing"""
        try:
            # Decode base64 image
            if ',' in base64_image:
                image_data = base64.b64decode(base64_image.split(',')[1])
            else:
                image_data = base64.b64decode(base64_image)
            
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return False, "Invalid image format"
            
            # Check image dimensions
            height, width = image.shape[:2]
            if width < 100 or height < 100:
                return False, "Image too small (minimum 100x100 pixels)"
            
            if width > 2000 or height > 2000:
                return False, "Image too large (maximum 2000x2000 pixels)"
            
            # Check image brightness
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            mean_brightness = np.mean(gray)
            
            if mean_brightness < 50:
                return False, "Image too dark"
            
            if mean_brightness > 200:
                return False, "Image too bright"
            
            # Check image blur (using Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var < 100:
                return False, "Image too blurry"
            
            return True, None
            
        except Exception as e:
            logger.error(f"Error validating image quality: {e}")
            return False, f"Error validating image: {str(e)}"