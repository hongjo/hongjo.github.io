<img src="img/blog/260330_Seokhwan/graphical_abstract.jpg" alt="Overview of the DSDL framework for tiny object detection" class="img-medium">

## Catching What Slips Through the Net: Introducing DSDL for Tiny Object Detection

I am proud to introduce our research recently accepted in **Automation in Construction**: **"Tiny Object Detection Using Distance-guided, Signed, and Densified Learning (DSDL) for Construction Site Safety Monitoring"**.

On construction sites, personal protective equipment (PPE) such as safety hooks and straps can mean the difference between life and death during work at height. However, these items are extremely small in surveillance footage -- often fewer than 16 x 16 pixels -- making them nearly invisible to conventional AI detection models. To solve this, we developed **DSDL**, a training-time enhancement that dramatically improves tiny object detection without modifying model architectures or sacrificing inference speed.

---

## The Problem: Why AI Misses Tiny Safety Equipment

Most object detection benchmarks and models are designed around objects of moderate size. In the widely used MS COCO dataset, the mean object area exceeds 20,000 pixels squared. In contrast, safety hooks in our YKH construction dataset occupy an average of just 88 pixels squared -- over 200 times smaller.

<img src="img/blog/260330_Seokhwan/fig01.png" alt="Mean object area comparison across datasets" class="img-medium">

This extreme size gap means that techniques optimized for general object detection systematically fail on the tiny objects that matter most for construction safety. We identified this as the **"Minnow Net Problem"** -- just as small fish slip through the wide meshes of a fishing net, tiny objects escape through the coarse structures of modern object detectors.

---

## The Minnow Net Problem: Three Ways Tiny Objects Escape

<img src="img/blog/260330_Seokhwan/fig02.png" alt="Three limitations of conventional object detection for tiny objects" class="img-medium">

We found that tiny objects are lost through three interrelated mechanisms:

- **Spatial Nets:** Anchor points in modern detectors are spaced 8, 16, or 32 pixels apart. When an object is smaller than this spacing, it may receive zero positive training samples -- the model literally never learns to detect it.
- **Range Nets:** Distribution Focal Loss (DFL) bins are restricted to positive values (0 to 16). But when anchor points are assigned outside a tiny object's boundary via D-TAL, negative offsets are needed to point back toward the object edges. Positive-only bins clip this information, causing boundary prediction errors.
- **Quantization Nets:** With only integer-spaced bins, the probabilistic distribution for tiny objects (whose boundaries fall between bins 0 and 1) collapses into a two-bin regression. The distributional advantage of DFL is completely lost.

---

## Our Solution: Distance-guided, Signed, and Densified Learning (DSDL)

DSDL addresses each facet of the Minnow Net Problem through three complementary techniques that operate entirely at training time:

1. **D-TAL** (Distance-guided Task Alignment Learning) -- tightens the spatial net
2. **S-DFL** (Signed Distribution Focal Loss) -- extends the range net
3. **D-DFL** (Densified Distribution Focal Loss) -- refines the quantization net

Crucially, DSDL requires **no architectural modifications**, preserves **pretrained weights**, and adds **zero overhead at inference**. It can be applied to any anchor-based one-stage detector that uses TAL and DFL.

---

## Component 1: Distance-guided Task Alignment Learning (D-TAL)

<img src="img/blog/260330_Seokhwan/fig04_distanceTAL.png" alt="Comparison of conventional TAL and D-TAL label assignment strategies" class="img-medium">

Standard Task-Aligned Learning (TAL) assigns positive training samples only to anchor points that fall within a ground-truth bounding box. For tiny objects smaller than the anchor stride, this can result in zero or very few positive samples.

D-TAL solves this by introducing a distance-based supplementary assignment. When an object is smaller than the anchor stride, D-TAL selects additional positive anchors based on L2 distance from the object center, then filters them using CIoU quality scores. This ensures every tiny object gets enough positive training signal.

The impact is striking: in our experiments, very tiny objects went from an average of **0.4 positive anchors to 3.8**, and tiny objects from **3.1 to 11.8**.

---

## Component 2: Signed Distribution Focal Loss (S-DFL)

<img src="img/blog/260330_Seokhwan/fig05_signedDFL.png" alt="Signed DFL extending distribution bins to negative values" class="img-medium">

With D-TAL assigning anchors outside tiny object boundaries, the predicted offsets to object edges can be negative. Standard DFL only supports bins from 0 to 16, forcing negative offsets to be clipped to zero. This destroys the boundary distribution information for tiny objects.

S-DFL simply extends the bin range to include negative values -- for example, from {-2, -1, 0, 1, ..., 16}. This allows the model to represent the full probability distribution over boundary offsets, preserving the information that DFL was designed to capture. We mathematically showed through KL divergence analysis that this prevents the information loss caused by positive-only bin truncation.

---

## Component 3: Densified Distribution Focal Loss (D-DFL)

<img src="img/blog/260330_Seokhwan/fig06.png" alt="Conventional DFL vs D-DFL quantization bins" class="img-medium">

Even with signed bins, standard DFL uses integer spacing (1.0 between bins). For tiny objects whose boundary offsets concentrate in the narrow range of [-2, 2], the probabilistic distribution collapses into just a few bins -- effectively reducing DFL to simple regression.

D-DFL introduces **non-uniform, densified bins** in this critical range. Specifically, bins in [-2, 2] are spaced at 0.25 intervals, providing 4x finer resolution where it matters most. Beyond this range, standard integer spacing is maintained. This restores the sub-bin precision needed for accurate tiny object boundary prediction.

---

## Experimental Results: Dramatic Improvements for Tiny Objects

We validated DSDL on two datasets with very different characteristics:

<img src="img/blog/260330_Seokhwan/fig09_YKH_visual.png" alt="Detection results with and without DSDL on YKH construction dataset" class="img-medium">

**YKH Dataset (Construction Site Safety):**
- Overall mAP@50: **+14.3 percentage points** (YOLOv9c: 65.5% to 79.8%)
- Tiny objects: **+48.6 percentage points** improvement
- Very tiny objects: **+13.1 percentage points** improvement
- With P2 layer: **85.9% mAP@50** (+7.3%p over YOLOv9c-P2 baseline)

**VisDrone Dataset (Aerial Imagery):**
- Overall mAP@50: **+3.8 percentage points** (YOLOv9c: 43.4% to 47.2%)
- Tiny objects: **+21.4 percentage points** improvement
- Very tiny objects: **+16.7 percentage points** improvement

**Model-agnostic capability:**
- YOLOv8s with DSDL: **+19.3%p** on YKH, **+13.1%p** on VisDrone

**No speed penalty:** Inference time remained approximately 30-37ms, identical to baselines.

<img src="img/blog/260330_Seokhwan/fig11_DSDLcomb.jpg" alt="Component-wise impact analysis of DSDL" class="img-medium">

The three components show strong synergy. While each addresses a distinct limitation, their combined effect far exceeds the sum of individual gains -- D-TAL provides more positive samples, S-DFL preserves their boundary distributions, and D-DFL sharpens the precision of those distributions.

In comparative studies, our YOLOv9c-P2-DSDL outperformed state-of-the-art methods including SO-DETR (85.9% vs 84.4% on YKH), SOC-YOLO (64.8%), and FFCA-YOLO (75.7%).

---

## Conclusion

DSDL demonstrates that the failure of modern detectors on tiny objects is not an inherent limitation of their architectures, but rather a consequence of training mechanisms that were never designed for extreme scale differences. By systematically addressing each facet of the Minnow Net Problem, DSDL achieves dramatic improvements in tiny object detection while remaining fully model-agnostic and inference-cost-free.

For construction safety monitoring, this means AI systems can now reliably detect the small but critical PPE items -- hooks and straps -- that protect workers at height. We believe this work contributes a practical step toward safer construction sites.

The source code is publicly available at [https://github.com/yyksh97/DSDL](https://github.com/yyksh97/DSDL).

---

## About the Author

<div class="author-card">
    <img src="img/member/student/김석환.jpg" alt="Seokhwan Kim" class="author-photo">
    <div class="author-info">
        <h4>Seokhwan Kim</h4>
        <p class="author-affiliation">Integrated Ph.D Course, Dept. of Civil and Environmental Engineering, Yonsei University</p>
        <p class="author-bio">
            I research computer vision and object detection for construction safety monitoring. My work focuses on detecting tiny safety equipment such as hooks and straps that conventional AI models frequently miss. Through DSDL, I aim to make AI-based safety monitoring systems more reliable for the objects that matter most in preventing construction accidents. My broader research interests include PTZ camera-based PPE detection and Monte Carlo simulation-based optimization for infrastructure maintenance.
        </p>
        <div class="author-contact">
            <a href="https://github.com/yyksh97" target="_blank"><i class="fab fa-github"></i> github.com/yyksh97</a>
        </div>
    </div>
</div>