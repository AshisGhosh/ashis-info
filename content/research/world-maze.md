---
title: "What maze navigation taught me about learned memory"
date: 2026-09-10
summary: "Memory supervision improved navigation, and persistent memory beat a reset control. Neither established that an explicit spatial map was the best model."
repo: https://github.com/AshisGhosh/world-maze
icon: compass
---

I started World Maze with a small question: can predicting a map teach a visual policy to navigate? After several rounds of experiments, the useful lesson was to separate three claims: a training signal helps, a memory mechanism helps, and an architecture beats a strong alternative. Evidence for one does not establish the others.

The testbed was a procedurally generated maze. A policy imitated an exploration expert using frozen visual features from first-person images and its own past actions. At evaluation, it had to navigate unseen mazes. Maps and poses could supply training targets, but the comparisons below gave the agent neither at inference.

## Remembering where you were helped

In an early 13×13 experiment, adding auxiliary objectives to predict past maps and relative pose raised success from **19.2% to 40.8%**. That comparison used five training seeds and 50 held-out mazes, with the same policy architecture and training budget. The improvement appeared in every seed.

This was a useful behavioral result: supervision about the agent's history improved navigation even though those targets were absent at inference. It did not, by itself, show that the policy had learned a usable internal map. A representation can contain decodable information without the policy relying on it.

Those numbers belong to the earlier interior-goal task. I later changed the goal to an opening in the maze's outer wall; the following results are a separate exit-task comparison.

## Persistence helped, but the sequence baseline still won

I then trained a model that wrote its own observations into a persistent spatial memory. It indexed memory using position estimated from its actions and whether the visual features changed after moving. This works unusually well in a discrete, noiseless maze; it is not a demonstration of realistic visual localization.

The controlled comparison was to train the same network with memory cleared at every step. Both versions retained the same position-estimation mechanism. Keeping the written memory raised success sharply:

| Model | Exit-task success |
|---|---:|
| Sequence policy with a predicted-map feature read | **50.8%** |
| Sequence policy with memory auxiliary losses | 46.2% |
| Persistent model-written memory | 43.3% |
| Same memory architecture, reset each step | 6.2% |

These are means over three training seeds on **200 fresh confirmation mazes**, using fixed final checkpoints. Persistent minus reset was **+37.2 percentage points**, with a paired maze-bootstrap 95% interval of **[+32.0, +42.5]**. But persistent minus the strongest sequence baseline was **−7.5 points**, with an interval of **[−13.7, −1.7]**. The intervals describe maze uncertainty conditional on those three trained models.

The large reset-control gain was real. The claim that I had built a better navigator was not supported. Nor did reset isolate the value of *spatial organization*: that would require a competitive memory control without spatial indexing.

## Finding the exit was the harder part

The persistent model saw the exit in **44.0%** of rollouts and succeeded in **98.5% of those rollouts**. The reset model saw it in only **6.3%**. Retaining memory mainly improved discovery; getting to an exit once visible was comparatively reliable in this environment.

That distinction required checking actual rendered visibility. A simulator marking a cell as “revealed” does not mean the camera saw it. Similarly, replacing perfect pose with learned odometry does not make a system self-contained if it still receives a simulator-generated map. Those distinctions changed which claims survived review.

The result I am keeping is modest: **memory-related supervision improved a visual policy, and persistent memory improved exploration within one architecture, while a strong sequence model remained better.** I am pausing the project with that conclusion. A further architecture sweep would need to answer a sharper question than whether another variant can score higher.

*Evidence: [per-seed results](/research/world-maze/results.csv) and [paired confirmation outcomes](/research/world-maze/confirmation.json). The earlier study uses five seeds on a repeatedly consulted development set; the exit confirmation uses three seeds and maze IDs 910000–910199. These are results from one synthetic environment, not a general claim about navigation or world models.*
