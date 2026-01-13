## 건설 문서를 이해하는 AI: RAGO-CONSTRUCT를 소개합니다

저의 새로운 연구 성과 **"저자원 언어 건설 문서를 위한 대조 문장 생성 및 마트료시카 표현 학습 기반 검색 최적화"** 논문이 **Automation in Construction (2026)** 저널에 게재되었습니다.

건설 엔지니어링은 방대한 기술 문서에 의존합니다. 하지만 일반적인 AI 모델은 한국 건설 산업의 특수한 용어를 이해하는 데 어려움을 겪으며, 이로 인해 틀린 답을 자신 있게 말하는 **'환각(Hallucination)'** 현상이 발생하곤 합니다. 이를 해결하기 위해, AI가 정확한 정보를 찾고 엔지니어에게 신뢰할 수 있는 답변을 제공하도록 돕는 시스템인 **RAGO-CONSTRUCT**를 개발했습니다.

---

## 전체 구조: 연구 프레임워크

AI의 "뇌"를 어떻게 개선했는지 이해하기 위해 연구의 전체적인 흐름을 살펴보겠습니다.

<img src="img/blog/260112_Kichang/FrameWork_ver2.png" alt="RAGO-CONSTRUCT 프레임워크" class="img-medium">

> **이 과정은 크게 세 단계로 이루어집니다:**
> * **데이터 생성**: 공식 건설 문서를 수집하고, 로컬 LLM을 활용해 이를 정교한 "학습 참고서"로 바꿉니다.
> * **미세 조정 (Fine-Tuning)**: 읽고 검색하는 역할을 하는 임베딩 모델을 이 참고서로 집중 훈련시킵니다.
> * **실전 활용 (RAG)**: 엔지니어가 질문을 던지면, AI가 정확한 문서를 찾아와 사실에 근거한 답변을 내놓는 단계입니다.

---

## 1단계: 자동 학습 참고서 만들기 (CSG)

건설과 같은 전문 분야에서는 단어 하나가 여러 의미를 가질 수 있습니다. 이러한 미세한 차이를 가르치기 위해 저는 **대조 문장 생성 (CSG)** 기법을 제안했습니다.

<img src="img/blog/260112_Kichang/Traning, Test dataset gen_ver2.png" alt="데이터셋 생성 과정" class="img-medium">

전문가에게 수천만 원을 주고 문제를 출제하는 대신, 로컬 AI를 활용해 공식 기준문서에서 문제를 자동으로 추출했습니다:
* **함의 (Positive)**: 원문과 의미는 같지만 표현만 다른 문장입니다.
* **모순 (Negative)**: 겉보기에는 비슷하지만 사실관계가 틀린 문장입니다.
* **중립 (Neutral)**: 관련은 있지만 정답은 아닌 문장입니다.

이 특별한 데이터셋을 **KorConNLI**라고 이름 붙였습니다. 이 데이터셋을 공부하며 AI는 무엇이 기술적으로 옳고 그른지를 명확히 구분하게 됩니다.

---

## 2단계: "임베딩 속의 임베딩" 전략 (SBE)

긴 문서에서 중요한 세부 정보를 찾는 것은 AI에게도 어려운 일입니다. 이를 해결하기 위해 러시아 인형인 **마트료시카(Matryoshka)**에서 영감을 얻은 **문장 블록 임베딩 (SBE)** 기술을 도입했습니다.

<img src="img/blog/260112_Kichang/Matryoshka Retrieval.png" alt="마트료시카 검색 과정" class="img-medium">

**작동 원리는 다음과 같습니다:**
1.  **나누기**: 긴 글을 4개의 작은 블록(각 128 토큰)으로 자릅니다.
2.  **압축하기**: 마트료시카 표현 학습(MRL)을 통해 가장 중요한 정보를 데이터 벡터의 맨 앞부분에 집중적으로 배치합니다.
3.  **결합하기**: 각 블록에서 가장 핵심적인 부분(앞쪽 192차원)만 뽑아 하나의 효율적인 벡터로 합칩니다.
4.  **정밀 검색**: 이를 통해 짧은 문장 수준의 정밀함으로 검색하면서도, 답변 시에는 페이지 전체의 맥락을 AI에게 제공할 수 있게 됩니다.

---

## 실험 결과: 글로벌 표준을 뛰어넘다

이 시스템이 일반적인 AI보다 정말 뛰어날까요? 결과는 '그렇다'입니다. 저는 현재 사용 가능한 가장 강력한 AI 모델들과 RAGO-CONSTRUCT를 비교 테스트했습니다.

* **높은 정확도**: RAGO-CONSTRUCT는 53.7\%의 검색 정확도를 기록하며, OpenAI의 text-embedding-3-large (41.4\%)보다 12.3%p 더 높은 성능을 보였습니다.
* **뛰어난 추론**: 전통적인 키워드 검색(BM25)과 비교했을 때, 성공률을 두 배 이상 높였습니다.
* **믿을 수 있는 답변**: 전체 답변 테스트에서 AI 답변의 성공률을 6.9%에서 53.5\%까지 끌어올렸습니다.

---

## 결론

이 연구는 건설 산업이 막대한 비용이나 수동 작업 없이도 AI를 도입할 수 있는 실질적인 방법을 제시합니다. **CSG**와 **SBE** 기술을 통해, 엔지니어가 질문을 던졌을 때 AI가 정확한 규정을 찾아 안전하고 올바른 답변을 제공할 수 있도록 돕겠습니다.

---

## 저자 소개

<div class="author-card">
    <img src="img/member/student/최기창.jpg" alt="최기창" class="author-photo">
    <div class="author-info">
        <h4>최기창 (Kichang Choi)</h4>
        <p class="author-affiliation">연세대학교 건설환경공학과 석박사 통합과정</p>
        <p class="author-bio">
            [cite_start]저는 건설 산업에 특화된 자연어 처리(NLP) 및 정보 검색 시스템을 연구하고 있습니다[cite: 6, 857]. [cite_start]특히 기술 분야나 한국어와 같은 저자원 언어 환경에서 일반 AI 모델이 가지는 한계를 극복하는 데 집중하고 있습니다[cite: 16, 49]. [cite_start]이번 RAGO-CONSTRUCT 연구를 통해, 복잡한 엔지니어링 지식을 현장의 전문가들이 더욱 쉽고 정확하게 활용할 수 있도록 돕고자 합니다[cite: 55, 135].
        </p>
        <div class="author-contact">
            <a href="mailto:amki1027@yonsei.ac.kr"><i class="fas fa-envelope"></i> amki1027@yonsei.ac.kr</a>
            <a href="https://github.com/Choikichang" target="_blank"><i class="fab fa-github"></i> github.com/Choikichang</a>
            <a href="https://choikichang.github.io/ko/projects/" target="_blank"><i class="fas fa-external-link-alt"></i>Choikichang Webpage</a>
        </div>
    </div>
</div>