**Research and Academic Writing for Graduate Students · Part 3**

## After finding a gap, what should you ask?

The previous article discussed identifying important questions that existing knowledge cannot adequately answer. Once you have a candidate gap, take another step:

> “What, exactly, will this study find out?”

A research question states what the study seeks to answer. A research hypothesis is a reasoned, testable, tentative answer. They are related, but forming a hypothesis takes more than turning a question into a statement. You should explain **why you expect that answer**.

The construction-document AI and crack-segmentation examples below are hypothetical. They do not report established effects or mechanisms.

## Questions, hypotheses, objectives, and assumptions

Farrugia and colleagues (2010) distinguish questions, hypotheses, and objectives and discuss aligning them in clinical and surgical research.[1] The distinction is useful in engineering too, although engineering studies need not follow the format of a clinical trial.

| Concept | Role | Hypothetical construction-document example |
| --- | --- | --- |
| Research question | What do we want to find out? | With the same evidence, does explicitly representing clause relationships improve judgment accuracy? |
| Research hypothesis | What answer do we expect, and why? | Explicit relationships will improve accuracy by making conditions and exceptions easier to connect. |
| Objective | What does the study aim to accomplish? | Compare two representations and analyze errors by question type. |
| Assumption | What premise is used in the design or analysis? | The supplied evidence is sufficient and the reference answers are trustworthy. |

Assumptions require justification or examination, for example through sensitivity analysis. A proposition treated as an assumption in one study may be a hypothesis tested in another.

## Turn a broad interest into an answerable question

“Can an LLM interpret construction documents well?” leaves several things unspecified: which documents, which questions, compared with what, and what counts as doing well?

A more specific question is:

> For questions requiring multiple clauses of construction specifications, does an explicit representation of clause relationships improve final judgment accuracy over a plain listing, using the same LLM and the same evidence?

This specifies the subject, comparison, conditions, and outcome. A study would still need to define its question set, reference answers, and representation procedure. It is one useful formulation, not a mandatory template.

Research questions need not ask “why.” They can describe the frequency of error types, predict outcomes at new sites, or compare methods under resource constraints. An objective such as “develop a program,” however, still leaves open what knowledge the development is intended to produce.

## A hypothesis needs a prediction, a rationale, and room for revision

A rationale may come from theory, prior studies, observations, or preliminary experiments. If the rationale is weak, acknowledge that and consider an exploratory question. Do not force a directional prediction when the direction is genuinely uncertain.

For the RAG example, a hypothesis could be:

> With the same underlying information, explicitly representing relationships among conditions and exceptions will improve judgment accuracy on multi-clause questions.

If the explicit representation includes extra facts or reveals the answer, the comparison cannot cleanly distinguish representation from information content. Evaluating interpretation of conditions, exceptions, and evidence alongside the final answer can help explain the results.

For crack segmentation:

> With the same training data and similar model capacity, preserving high-resolution features will reduce missed thin cracks.

Overall IoU may be insufficient to evaluate this hypothesis. Define what counts as a thin crack, how misses and false positives will be measured, and how capacity will be compared.

Then ask: **What result would make me revise this view?** Explicit relationships might show no improvement; an apparent benefit might disappear when extra information is removed; a larger model might produce the same result. Considering these possibilities clarifies the experiment.

## Design experiments that distinguish alternative explanations

Platt’s “Strong Inference” (1964) emphasizes developing alternatives and designing experiments that distinguish them.[2] Applied to a student project, this means asking both “Does the method work?” and “Could another explanation account for the result?”

An ablation in which removing a component reduces performance can support an effect of including that component under the tested conditions. The difference alone does not establish the proposed internal mechanism. Comparisons may need to distinguish representation, capacity, or training-related explanations.

## Are research hypotheses and statistical hypotheses the same?

A research hypothesis makes a substantive claim about a phenomenon or method. A statistical hypothesis expresses a claim about population differences, relationships, or distributions within a specified model.

Suppose Δ denotes the mean performance difference of interest: proposed method minus comparison method. A prespecified test for improvement might use H₀: Δ ≤ 0 and H₁: Δ > 0. A question without a specified direction may call for a two-sided test. Choose the formulation according to the question and analysis plan, rather than selecting a favorable direction after seeing the results.

Questions from the same document or images from the same site may also be dependent. Writing down hypothesis symbols does not make the analysis appropriate.

As the ASA statement explains, a p-value is the probability, under a specified statistical model and null hypothesis, of a test statistic at least as extreme as the observed value. It is not the probability that a hypothesis is true or a measure of effect size.[3] A nonsignificant result also does not establish equivalence. An equivalence claim requires a substantively justified margin and a suitable analysis.

## Not every study needs a prespecified hypothesis

Exploratory studies can characterize phenomena and generate hypotheses for later testing. Dataset construction, measurement development, and design research can have clear questions and evaluation criteria without beginning with a directional hypothesis. Whether to label statements RQ1 or H1 depends on disciplinary conventions and the structure of the paper.

What matters is distinguishing prior expectations from ideas developed after observing results. Kerr’s (1998) *HARKing* concerns presenting a post hoc hypothesis as though it had been specified in advance.[4] Generating new hypotheses from findings is not itself the problem.

Nosek and colleagues (2018) discuss preregistration as a way to distinguish hypothesis generation from testing.[5] Internal planning notes are useful, but are not the same as formal preregistration that creates a verifiable record. Report exploration as exploration, then develop it through testing with separate data or a subsequent study.

## A one-page plan for your next meeting

Check whether these five elements fit together:

1. **Question:** What do you want to know, about what subject, under which conditions?
2. **Expectation:** If a hypothesis is appropriate, what answer do you expect and why?
3. **Comparison:** Which conditions must be compared to answer the question?
4. **Measurement:** Which outcomes will be measured, and how?
5. **Interpretation:** What findings would support, revise, or prompt further examination of the hypothesis?

A good hypothesis is not the researcher’s preferred conclusion written in advance. It is a reasoned provisional answer that evidence can challenge.

## References and reading notes

1. Farrugia, P., Petrisor, B. A., Farrokhyar, F., & Bhandari, M. (2010). Research questions, hypotheses and objectives. *Canadian Journal of Surgery, 53*(4), 278–281. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC2912019/)
2. Platt, J. R. (1964). Strong inference. *Science, 146*(3642), 347–353. [DOI](https://doi.org/10.1126/science.146.3642.347)
3. Wasserstein, R. L., & Lazar, N. A. (2016). The ASA’s statement on p-values: Context, process, and purpose. *The American Statistician, 70*(2), 129–133. [DOI](https://doi.org/10.1080/00031305.2016.1154108)
4. Kerr, N. L. (1998). HARKing: Hypothesizing after the results are known. *Personality and Social Psychology Review, 2*(3), 196–217. [DOI](https://doi.org/10.1207/s15327957pspr0203_4)
5. Nosek, B. A., Ebersole, C. R., DeHaven, A. C., & Mellor, D. T. (2018). The preregistration revolution. *Proceedings of the National Academy of Sciences, 115*(11), 2600–2606. [DOI](https://doi.org/10.1073/pnas.1708274114)

The methodological ideas are applied here to engineering examples. These sources do not directly test the hypothetical RAG or crack-segmentation hypotheses in this article.

## A visual recap

[![Questions, hypotheses, objectives, assumptions, study planning, and cautions about interpretation](/img/blog/research-writing/03-en.webp)](/img/blog/research-writing/03-en.webp)

*Select the image to view it at full size.*

<!-- research-series-navigation -->

---

[이 글의 한국어 버전](/ko/blog/research-writing-03-questions-and-hypotheses/)

**Research and Academic Writing for Graduate Students**

1. [What Is Research?](/blog/research-writing-01-what-is-research/)
2. [How to Find a Research Gap](/blog/research-writing-02-finding-a-research-gap/)
3. [How to Formulate Research Questions and Hypotheses](/blog/research-writing-03-questions-and-hypotheses/)
4. [How to Design Good Experiments](/blog/research-writing-04-experimental-design/)
