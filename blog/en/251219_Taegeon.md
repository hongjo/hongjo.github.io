<img src="img/blog/251219_Taegeon/title.png" alt="Overview of the proposed LVLM-based construction safety assessment framework" class="img-medium">
This article reviews the paper "Moving-feature-driven label propagation for training data generation from target domains," published in Computers in Industry (Elsevier) in 2025, focusing on how the research addresses data challenges in CCTV-based object detection for construction sites.

This study is notable for approaching the domain shift problem in construction site CCTV footage from a data generation perspective rather than modifying model architectures. While methods such as transfer learning, domain adaptation, and synthetic data generation have been explored to improve generalization, collecting and annotating data from new target domains remains a labor-intensive bottleneck.

In the construction industry, the use of CCTV-based object detection technology is expanding for safety management, progress monitoring, and productivity analysis. If key objects such as workers, heavy equipment, and vehicles can be automatically recognized, site conditions can be monitored in real-time to support management decisions.

However, when applying AI-based object detection models to actual construction sites, a fundamental problem repeatedly arises. When images from environments different from the training data are input, model performance degrades significantly. This is because deep learning models are highly sensitive to the distribution of training data, and the larger the visual difference between source and target domains, the more severe the performance degradation becomes.

This article reviews research that attempts to automatically generate training data using only unlabeled video from new construction sites. In particular, it examines how the proposed approach differs from existing construction AI research and what limitations it realistically addresses.

---

## The Role of Object Detection and Deep Learning Models

Object Detection is a deep learning-based technology that simultaneously estimates where specific objects are located and what they are in images or videos. In construction site CCTV analysis, it is primarily used to recognize key objects such as workers, excavators, and dump trucks.

A typical object detection model operates through the following process:

- Extract visual features from input images
- Determine whether those features correspond to specific objects
- Predict both the location (bounding box) and class of objects

These models show high performance when trained on sufficient labeled training data, but performance degradation often occurs when images from different environments are input. In the construction domain, large-scale datasets such as the MOCS dataset (41,668 images, 13 classes) and SODA dataset (over 20,000 images, 15 categories) have been released, but even models trained on these datasets have been reported to show significant performance degradation on new sites.

---

## Data Problems in Construction Site Object Detection

Construction sites have highly diverse filming environments that are difficult to standardize.

- Different camera positions and viewpoints at each site (far-field monitoring, top-down view, etc.)
- Changes in weather, lighting, and background structure (snow, rain, occlusion by safety nets, etc.)
- Differences in appearance of equipment and workers

As a result, when object detection models trained on existing data are applied directly to new sites, performance often degrades significantly. In the deep learning field, this is called the domain shift problem. This problem intensifies when there are large visual differences in object appearances, backgrounds, monitoring settings, lighting, and weather conditions between source and target domains.

The most intuitive solution is to collect and label data again at the new site, but this has significant practical constraints in terms of time and cost. This study proposes a method to automatically generate training data from unlabeled site footage to address this problem.

---

## Core Research Question

This paper starts from the following question:

> Can an object detection model be retrained using only unlabeled video from a new construction site?

To address this, the researchers propose a data-centric approach that automatically generates training data rather than modifying model structures. This method is based on the Source-Free Domain Adaptive Object Detection (SFOD) framework, utilizing only pre-trained models without access to original source domain data during the adaptation process. This design considers practical constraints such as data privacy, proprietary limitations, and regulatory compliance.

---

## Method Overview

The proposed method consists of three main stages:

1. Moving object detection using optical flow estimation
2. Label propagation based on self-training
3. Training data generation through image inpainting and copy-paste augmentation

This pipeline generates target domain-specific training data by utilizing both foreground and background from target domain footage.

---


<!-- Figure 1 -->
<img src="img/blog/251219_Taegeon/Fig1.png" alt="Figure 1. Overview of the proposed framework" class="img-medium">

---

## Step 1. Moving Object Detection Using Optical Flow

One important characteristic of construction site footage is that workers and equipment move continuously. This study utilizes this movement characteristic to automatically extract object candidate regions without labels.

Optical flow is a technique that calculates pixel displacement between consecutive video frames to estimate regions where movement occurs. Each vector represents the direction and magnitude of pixel movement, enabling the identification of moving object locations.

This study uses Global Motion Aggregation (GMA), a transformer-based optical flow model. GMA is known to be effective at estimating movement of occluded objects, making it suitable for occlusion situations that frequently occur in far-field monitoring environments.

After optical flow estimation, the following post-processing steps are applied:

- Temporal low-pass filter: Extracts only regions that move consistently across 5 consecutive frames
- Morphological processing: Removes small noise using opening operations
- Median blurring: Removes residual salt-and-pepper noise
- SORT (Simple Online and Realtime Tracking) algorithm: Tracks consistent bounding boxes across frames based on Kalman filter and Hungarian algorithm

This automatically extracts candidate regions likely to be objects and removes temporarily occurring false positives.

---

<!-- Figure 2 -->
<img src="img/blog/251219_Taegeon/Fig2.png" alt="Figure 2. Moving object detection using optical flow" class="img-medium">

---

## Step 2. Self-training Based Label Propagation

The extracted object candidates do not yet have class information. Self-training techniques are used to address this.

Self-training is a method that progressively improves model performance through iterative training on a mixture of labeled and unlabeled data. This study applies a teacher-student framework inspired by the Noisy Student approach.

The specific process is as follows:

- Teacher model training: An EfficientNetV2 classification model is pre-trained on the MOCS dataset (41,668 images, 13 classes). Cropped images of 500 per class are used, with data augmentation techniques such as Random rotation, Random horizontal flip, and Random erasing applied.
- Pseudo label generation: The teacher model predicts classes for extracted object candidate regions. Only predictions with confidence scores of 0.98 or higher are assigned as pseudo labels, prioritizing precision.
- Student model training: The student model is trained by combining generated pseudo labels with original source domain data.
- Iterative learning: The trained student model becomes the teacher model for the next iteration, generating new pseudo labels for candidate regions not labeled in previous iterations.

Through this process, labels are gradually propagated to more objects, starting from objects in the target domain most similar to source domain foregrounds. In experiments, 3 self-training iterations were performed, with pseudo label recall increasing in each iteration while precision maintained at 1.0.

---

## Step 3. Training Data Generation Using Image Inpainting and Copy-Paste

Object detection models need to learn background information as well as objects. However, pseudo labels only contain object regions (bounding boxes) and lack background information. Additionally, target domain footage contains unlabeled objects, and if these are learned as background, detection performance can degrade.

To address this problem, the study combines two techniques:

### Image Inpainting

The MAT (Mask-Aware Transformer) model is used to remove foreground objects from images and restore natural backgrounds. The MAT model is pre-trained on the Places2 dataset, which includes various place categories including construction sites, allowing use without additional fine-tuning. Input requires the original image and a binary mask image marking foreground regions, and this mask generation is the only manual labeling process in the proposed method.

### Copy-Paste Augmentation

Training data is generated by randomly placing objects with pseudo labels on restored background images. 3-5 pseudo labels are placed on each background image without overlap to ensure data diversity. This approach is known to be effective for improving instance segmentation and object detection performance.

This enables mass generation of object detection training data that reflects the visual characteristics of the target domain (background, lighting, color, etc.).

---

<!-- Figure 3 -->
<img src="img/blog/251219_Taegeon/Fig3.jpg" alt="Figure 3. Image inpainting process" class="img-medium">


<!-- Figure 4 -->
<img src="img/blog/251219_Taegeon/Fig4.jpg" alt="Figure 5. Generated training data examples" class="img-medium">

---

## Experimental Results Summary

Experiments were conducted on 4 construction site videos (target domains) with different visual characteristics. All videos were captured in far-field CCTV monitoring environments, and each site includes unique visual challenges.

- Target domain 1: Snowy weather conditions making excavator boundaries appear blurry
- Target domain 2: Workers frequently occluded by safety nets
- Target domain 3: Top-down perspective where object appearances differ significantly from typical training data
- Target domain 4: Small, blurry worker images due to top-down perspective and far-field view

Results from retraining YOLOv5m models using automatically generated training data showed the following improvements:

- Target domain 1: Excavator class recall improved from 0.706 to 0.989 (28.3 percentage points)
- Target domain 2: Worker class precision improved from 0.686 to 0.829 (14.3 percentage points)
- Target domain 3: Dump truck class recall improved from 0.351 to 0.852 (50.1 percentage points)
- Target domain 4: Dump truck class recall improved significantly from 0.061 to 0.998

A notable point is that the precision of generated pseudo labels maintained at 1.0 across all iterations. This means the high confidence threshold (0.98) setting effectively prevented incorrect labels from being included in training data.

When compared with models trained on manually labeled data (Model C), models trained on data generated by the proposed method (Model A) showed similar or better performance in most cases. Additionally, compared to CycleGAN-based style transfer and ConfMix-based domain adaptation methods, the proposed method showed more consistent performance improvements.

---

## Significance and Application Possibilities

The value of this research can be summarized as follows:

- Data-centric adaptation strategy reflecting construction site characteristics: Generates target domain-specific training data without model structure changes
- Reduced manual labeling burden: The only manual work in the entire pipeline is foreground mask generation for image inpainting
- Source-free adaptation capability: No access to original training data required during adaptation
- Enhanced scalability of CCTV-based construction AI systems: Enables automated adaptation when deploying to new sites

This research is not a complete solution that solves all problems, but rather presents a necessary step for construction AI to expand to actual sites.

---

## Limitations and Future Research Directions

The researchers acknowledge the following limitations:

- Lack of validation under various lighting/weather conditions within the same site
- Unverified effectiveness for object classes other than workers, excavators, and dump trucks
- Performance limitations in heavy occlusion environments
- High computational costs due to multiple stages (optical flow estimation, self-training iterations, data augmentation)

Future research requires validation of generalization performance under various environmental conditions, expansion to more object classes, improvement of occlusion handling, and optimization of computational efficiency for real-time application.

---

## Conclusion

Construction sites are environments that are difficult to standardize, and it is challenging for AI models to be applied to all sites with a single training session.

This research explored the possibility of AI learning new sites autonomously from a data perspective, based on this reality. The pipeline from movement information analysis to label generation and image synthesis presents a novel solution for addressing domain shift in complex and unstructured construction site environments.

---

## About the Author

<div class="author-card">
    <img src="img/member/student/김태건.jpg" alt="Taegeon Kim" class="author-photo">
    <div class="author-info">
        <h4>Taegeon Kim</h4>
        <p class="author-affiliation">Integrated MS/PhD Program, Dept. of Civil and Environmental Engineering, Yonsei University</p>
        <p class="author-bio">
            Researching construction AI and deep learning applications including CCTV-based object detection, domain adaptation, and automatic training data generation for construction sites. Interested in constraints of real-world site video data and data-centric learning methods to overcome them.<br><br>
            Currently serving as CEO of ONTOH, a construction AI startup. ONTOH is developing an AI CCTV solution that combines Physical AI technology for recognizing and interpreting hazardous situations in construction site CCTV footage with generative AI technology for creating safety documents and reports using site video and management data. Additionally, developing systems for proactive health and safety management at construction sites through health DB construction and site-level health monitoring for vulnerable workers such as elderly workers and those with underlying conditions.
        </p>
        <div class="author-contact">
            <a href="mailto:geon9655@gmail.com"><i class="fas fa-envelope"></i> geon9655@gmail.com</a>
            <a href="tel:+82-10-6737-6598"><i class="fas fa-phone"></i> +82-10-6737-6598</a>
            <a href="https://hongjo.github.io/" target="_blank"><i class="fas fa-globe"></i> hongjo.github.io</a>
        </div>
    </div>
</div>

