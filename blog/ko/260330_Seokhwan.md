<img src="img/blog/260330_Seokhwan/graphical_abstract.jpg" alt="DSDL 프레임워크 개요" class="img-medium">

## 그물을 빠져나가는 작은 물고기: 건설 현장 안전 모니터링을 위한 DSDL 소개

저의 새로운 연구 성과 **"Tiny Object Detection Using Distance-guided, Signed, and Densified Learning (DSDL) for Construction Site Safety Monitoring"** 논문이 **Automation in Construction** 저널에 게재 승인되었습니다.

건설 현장에서 안전 후크(hook)와 스트랩(strap) 같은 개인보호장비(PPE)는 고소 작업 시 생명을 좌우하는 핵심 장비입니다. 그러나 이러한 장비들은 감시 영상에서 16 x 16 픽셀 미만의 극소 크기로 촬영되어, 기존 AI 탐지 모델로는 거의 인식이 불가능합니다. 이 문제를 해결하기 위해, 모델 구조를 변경하지 않으면서도 초소형 객체 탐지 성능을 획기적으로 향상시키는 학습 기법 **DSDL**을 개발했습니다.

---

## 문제 인식: AI가 초소형 안전장비를 놓치는 이유

대부분의 객체 탐지 벤치마크와 모델은 중간 크기 이상의 객체에 최적화되어 있습니다. 널리 사용되는 MS COCO 데이터셋의 평균 객체 면적은 20,000 픽셀 제곱을 넘지만, 저희 YKH 건설 데이터셋의 안전 후크는 평균 88 픽셀 제곱에 불과합니다 -- 200배 이상 작은 크기입니다.

<img src="img/blog/260330_Seokhwan/fig01.png" alt="데이터셋별 평균 객체 면적 비교" class="img-medium">

이러한 극단적인 크기 차이는 일반적인 객체 탐지 기법이 건설 안전에서 가장 중요한 초소형 객체를 체계적으로 놓치게 만듭니다. 저희는 이를 **"Minnow Net Problem(작은 물고기 그물 문제)"**이라 명명했습니다. 큰 그물코를 빠져나가는 작은 물고기처럼, 초소형 객체가 현대 객체 탐지기의 성긴 구조를 빠져나간다는 비유입니다.

---

## Minnow Net Problem: 초소형 객체가 빠져나가는 세 가지 경로

<img src="img/blog/260330_Seokhwan/fig02.png" alt="기존 객체 탐지기의 초소형 객체 탐지 한계 세 가지" class="img-medium">

초소형 객체가 탐지에서 누락되는 원인을 세 가지 상호 연관된 메커니즘으로 분석했습니다.

- **Spatial Nets (공간 그물):** 현대 탐지기의 앵커 포인트는 8, 16, 32 픽셀 간격으로 배치됩니다. 객체가 이 간격보다 작으면 positive 학습 샘플이 전혀 할당되지 않아, 모델이 해당 객체를 학습할 기회 자체가 사라집니다.
- **Range Nets (범위 그물):** Distribution Focal Loss(DFL)의 빈(bin)이 양수 값(0~16)으로만 제한됩니다. 그러나 D-TAL로 객체 경계 밖의 앵커가 할당되면, 객체 가장자리까지의 거리가 음수가 됩니다. 양수 전용 빈은 이 정보를 잘라내어 경계 예측 오류를 유발합니다.
- **Quantization Nets (양자화 그물):** 정수 간격(1.0) 빈만 사용하면, 경계 오프셋이 0과 1 사이에 집중되는 초소형 객체의 확률 분포가 두 개의 빈으로 붕괴됩니다. DFL의 분포적 장점이 완전히 사라지는 것입니다.

---

## 제안 방법: Distance-guided, Signed, and Densified Learning (DSDL)

DSDL은 Minnow Net Problem의 각 측면을 해결하는 세 가지 상호 보완적 기법으로 구성되며, 모두 학습 시점에서만 작동합니다.

1. **D-TAL** (Distance-guided Task Alignment Learning) -- 공간 그물을 촘촘하게
2. **S-DFL** (Signed Distribution Focal Loss) -- 범위 그물을 확장
3. **D-DFL** (Densified Distribution Focal Loss) -- 양자화 그물을 정밀하게

핵심적으로, DSDL은 **모델 구조 변경이 필요 없고**, **사전학습 가중치를 그대로 유지**하며, **추론 시 추가 비용이 전혀 없습니다**. TAL과 DFL을 사용하는 모든 앵커 기반 1단계 탐지기에 적용할 수 있습니다.

---

## 핵심 기술 1: 거리 기반 태스크 정렬 학습 (D-TAL)

<img src="img/blog/260330_Seokhwan/fig04_distanceTAL.png" alt="기존 TAL과 D-TAL 라벨 할당 전략 비교" class="img-medium">

기존 Task-Aligned Learning(TAL)은 정답 바운딩 박스 내부에 위치한 앵커 포인트에만 positive 학습 샘플을 할당합니다. 앵커 간격보다 작은 초소형 객체의 경우, positive 샘플이 0개 또는 극소수에 그칠 수 있습니다.

D-TAL은 거리 기반 보충 할당을 도입하여 이를 해결합니다. 객체가 앵커 간격보다 작을 때, 객체 중심으로부터의 L2 거리를 기준으로 추가 positive 앵커를 선택한 뒤, CIoU 품질 점수로 필터링합니다. 이를 통해 모든 초소형 객체가 충분한 학습 신호를 받을 수 있습니다.

효과는 매우 뚜렷합니다. 실험에서 very tiny 객체의 평균 positive 앵커 수가 **0.4개에서 3.8개로**, tiny 객체는 **3.1개에서 11.8개로** 증가했습니다.

---

## 핵심 기술 2: 부호 확장 분포 초점 손실 (S-DFL)

<img src="img/blog/260330_Seokhwan/fig05_signedDFL.png" alt="S-DFL의 분포 빈 음수 확장" class="img-medium">

D-TAL이 초소형 객체 경계 밖의 앵커를 할당하면, 객체 가장자리까지의 예측 오프셋이 음수가 될 수 있습니다. 기존 DFL은 빈 범위가 0~16으로 제한되어 있어 음수 오프셋이 0으로 클리핑되고, 초소형 객체의 경계 분포 정보가 손실됩니다.

S-DFL은 빈 범위를 음수로 확장합니다 -- 예를 들어 {-2, -1, 0, 1, ..., 16}. 이를 통해 경계 오프셋의 전체 확률 분포를 표현할 수 있으며, DFL이 본래 포착하도록 설계된 정보를 보존합니다. KL divergence 분석을 통해 양수 전용 빈 절단으로 인한 정보 손실이 방지됨을 수학적으로 증명했습니다.

---

## 핵심 기술 3: 고밀도 분포 초점 손실 (D-DFL)

<img src="img/blog/260330_Seokhwan/fig06.png" alt="기존 DFL과 D-DFL 양자화 빈 비교" class="img-medium">

부호 확장 빈을 사용하더라도, 기존 DFL은 정수 간격(1.0)을 사용합니다. 경계 오프셋이 [-2, 2]의 좁은 범위에 집중되는 초소형 객체의 경우, 확률 분포가 몇 개의 빈으로 붕괴되어 사실상 단순 회귀와 다름없게 됩니다.

D-DFL은 이 핵심 구간에 **비균일 밀집 빈**을 도입합니다. 구체적으로, [-2, 2] 구간에 0.25 간격의 빈을 배치하여 가장 중요한 영역에서 4배 높은 해상도를 제공합니다. 이 범위를 벗어난 구간에서는 기존 정수 간격을 유지합니다. 이를 통해 초소형 객체 경계의 정확한 예측에 필요한 sub-bin 정밀도를 확보합니다.

---

## 실험 결과: 초소형 객체에서 극적인 성능 향상

서로 다른 특성을 가진 두 데이터셋에서 DSDL을 검증했습니다.

<img src="img/blog/260330_Seokhwan/fig09_YKH_visual.png" alt="YKH 건설 데이터셋에서 DSDL 적용 전후 탐지 결과" class="img-medium">

**YKH 데이터셋 (건설 현장 안전):**
- 전체 mAP@50: **+14.3 퍼센트 포인트** (YOLOv9c: 65.5% → 79.8%)
- Tiny 객체: **+48.6 퍼센트 포인트** 향상
- Very tiny 객체: **+13.1 퍼센트 포인트** 향상
- P2 레이어 추가 시: **85.9% mAP@50** (YOLOv9c-P2 대비 +7.3%p)

**VisDrone 데이터셋 (항공 영상):**
- 전체 mAP@50: **+3.8 퍼센트 포인트** (YOLOv9c: 43.4% → 47.2%)
- Tiny 객체: **+21.4 퍼센트 포인트** 향상
- Very tiny 객체: **+16.7 퍼센트 포인트** 향상

**모델 무관 적용:**
- YOLOv8s에 DSDL 적용: YKH에서 **+19.3%p**, VisDrone에서 **+13.1%p**

**속도 저하 없음:** 추론 시간은 약 30-37ms로 베이스라인과 동일했습니다.

<img src="img/blog/260330_Seokhwan/fig11_DSDLcomb.jpg" alt="DSDL 구성 요소별 성능 기여 분석" class="img-medium">

세 가지 구성 요소는 강력한 시너지를 보입니다. 각각 서로 다른 한계를 해결하기 때문에, 결합 효과가 개별 효과의 합을 크게 초과합니다. D-TAL이 더 많은 positive 샘플을 제공하고, S-DFL이 그 경계 분포를 보존하며, D-DFL이 분포의 정밀도를 높입니다.

비교 연구에서 저희 YOLOv9c-P2-DSDL은 SO-DETR(YKH: 85.9% vs 84.4%), SOC-YOLO(64.8%), FFCA-YOLO(75.7%) 등 최신 기법들을 상회하는 성능을 달성했습니다.

---

## 결론

DSDL은 현대 탐지기가 초소형 객체에서 실패하는 원인이 아키텍처의 본질적 한계가 아니라, 극단적인 크기 차이를 고려하지 않은 학습 메커니즘에 있음을 보여줍니다. Minnow Net Problem의 각 측면을 체계적으로 해결함으로써, 완전히 모델에 구애받지 않고 추론 비용 추가 없이 초소형 객체 탐지 성능을 획기적으로 향상시켰습니다.

건설 안전 모니터링 관점에서, 이는 AI 시스템이 고소 작업자를 보호하는 핵심 PPE 장비인 안전 후크와 스트랩을 이제 신뢰성 있게 탐지할 수 있음을 의미합니다. 이 연구가 더 안전한 건설 현장을 만드는 데 실질적으로 기여하기를 바랍니다.

소스 코드는 [https://github.com/yyksh97/DSDL](https://github.com/yyksh97/DSDL)에서 공개되어 있습니다.

---

## 저자 소개

<div class="author-card">
    <img src="img/member/student/김석환.jpg" alt="김석환" class="author-photo">
    <div class="author-info">
        <h4>김석환 (Seokhwan Kim)</h4>
        <p class="author-affiliation">연세대학교 건설환경공학과 석박사 통합과정</p>
        <p class="author-bio">
            건설 현장 안전 모니터링을 위한 컴퓨터 비전 및 객체 탐지 기술을 연구하고 있습니다. 특히 기존 AI 모델이 놓치기 쉬운 안전 후크, 스트랩 등 초소형 안전장비의 탐지 성능 향상에 집중하고 있습니다. 이번 DSDL 연구를 통해, 건설 현장에서 가장 중요한 안전장비를 정확히 탐지할 수 있는 신뢰성 높은 AI 안전 모니터링 시스템 구축에 기여하고자 합니다. PTZ 카메라를 활용한 개인보호장비(PPE) 탐지, 몬테카를로 시뮬레이션 기반 인프라 유지관리 최적화 등도 함께 연구하고 있습니다.
        </p>
        <div class="author-contact">
            <a href="https://github.com/yyksh97" target="_blank"><i class="fab fa-github"></i> github.com/yyksh97</a>
        </div>
    </div>
</div>