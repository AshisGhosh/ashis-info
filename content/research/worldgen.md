---
title: "WorldGen: An Action-Conditioned Flow Matching World Model for Visual Navigation"
date: 2025-12-07
summary: "An incremental study of action-conditioned world models in a controlled visual environment, from a baseline diffusion transformer through FiLM conditioning, classifier-free guidance, and flow matching, evaluated with KID."
repo: https://github.com/AshisGhosh/worldgen
publisher: "GitHub"
icon: trajectory
---

WorldGen explores learning action-conditioned world dynamics from visual observations. The model sees a 64×64 crop of a larger map, receives one of four discrete actions, and predicts the crop that would result from translating 8 pixels in the corresponding direction.

The setup is intentionally narrow. With no physics, no sensor noise, and no occlusion, the model has to learn the rules of the environment and little else, which makes it useful for studying design choices in isolation.

The project went through several iterations: a plain diffusion transformer, then action conditioning, classifier-free guidance, and finally flow matching. The sections below walk through each step and the comparisons across them.

## The learning problem

The dataset is built from random 64×64 crops of a single larger world map. Each training example pairs a start crop, a discrete action drawn from {up, down, left, right}, and the end crop that results from translating the start crop 8 pixels in the direction of the action.

![World map](/research/worldgen/world_map.png)

The world is a static 2D image: tiles of land, water, and structures. There is no agent, no physics, and no occlusion. The actions are translations of the viewing window, not movements of an actor.

![Moving the viewing window left](/research/worldgen/move_left.png)

This formulation strips a world model down to its core: given an observation and an intent, produce the next observation. Whatever the model fails at can be traced to a specific modeling choice rather than to environmental noise.

## An unconditional baseline

The starting point is a Diffusion Transformer (DiT) trained to generate unconditional samples from the world-map distribution. Crops are split into 4×4 patches, projected to a hidden dimension, and processed by self-attention blocks with learned positional embeddings. A sinusoidal time embedding, passed through an MLP, conditions each block on the denoising timestep. Training follows the standard DDPM formulation with a cosine noise schedule and T=400 timesteps.

This baseline has no notion of actions and cannot solve the world-model task. Its purpose is to establish a generative backbone that produces map-like images, and to provide a KID reference point the conditional models can be compared against.

Two architectural changes were made early on that carried forward into every later model:

- **RMSNorm in place of LayerNorm.** Training was cleaner.
- **FiLM (Feature-wise Linear Modulation) for conditioning.** Instead of adding a time embedding to the residual stream, FiLM computes a scale and shift from the conditioning vector and applies them per-channel after each normalization layer. The scale and shift give the conditioning signal a stronger influence on activations than addition does. This choice was made in the unconditional setting but pays off most once the conditioning vector carries more than just timestep, in particular when action and start-state embeddings are added.

A separate increase from 128 to 256 hidden dimensions improved sample quality at the cost of training time.

## From DiT to WorldDiT

Turning the unconditional model into an action-conditioned world model adds two inputs to the conditioning pathway: the start image, and the action. The start image is processed by a small CNN encoder (three convolution blocks with max-pooling) into a fixed-size feature vector. The action, a discrete index from 0 to 3, is embedded through a learned lookup. These two embeddings are concatenated with the time embedding and projected into the FiLM conditioning vector that modulates each transformer block.

The denoising target is the noised end image. At inference, the model takes a clean start image, an action, and pure noise the shape of the end image, and iteratively denoises into a prediction.

Two things are worth noting. First, the start image enters only through the conditioning pathway; the transformer's input tokens are still patches of the noised end image. The start image therefore has to travel through the conditioning bottleneck to influence the output, which puts pressure on the vision encoder to extract genuinely useful features. Second, because conditioning is FiLM-based and applied at every block, the start-state and action signals are injected throughout the network rather than at a single layer.

## Classifier-free guidance

Classifier-free guidance is a training-time and inference-time modification. During training, the start image and action embeddings are independently replaced by learned "null" embeddings with some small probability (10% here). At inference, the model is run twice, once with the true conditioning and once with the null embeddings, and the two predictions are interpolated:

```python
eps = eps_uncond + cfg_scale * (eps_cond - eps_uncond)
```

This pushes samples toward the conditional distribution at the cost of some diversity.

## Flow matching

The most consequential change came from replacing the DDPM objective with flow matching. Instead of training the network to predict noise given a noised input and a timestep, the network predicts a *velocity*, the direction from noise to data along a linear interpolation. Sampling becomes ODE integration:

```python
# Training
x_t = (1 - t) * x_0 + t * x_1     # x_0 is noise, x_1 is the data sample
v_target = x_1 - x_0
loss = MSE(model(x_t, t, start, action), v_target)

# Sampling, with Euler steps
for t in linspace(0, 1, num_steps):
    v = model(x, t, start, action)
    x = x + v * dt
```

There is no noise schedule to design, no posterior to derive, and no large T. The same architecture (FiLM-conditioned transformer over patches) is used; the only things that change are the training objective and the sampling loop.

The practical benefit is sampling cost. The DDPM models in this project use 100 sampling steps; the flow matching models produce comparable KID with 10.

## Reading the comparisons

| Run | Experiment | Duration | Training Loss | Eval Loss | KID |
|-----|------------|----------|---------------|-----------|-----|
| world_flow_clsfg | world_flow + CFG | 3h 17m | 0.200 | 0.089 | **0.102** |
| world_flow_base | world_flow | 3h 44m | 0.197 | 0.089 | 0.103 |
| world_clsfg | world_model + CFG | 7h 20m | 0.061 | 0.010 | 0.129 |
| world_filmcond_pre | world_model (pretrain) | 3h 34m | 0.049 | 0.007 | 0.106 |
| world_filmcond | world_model | 3h 35m | 0.050 | 0.007 | 0.128 |
| world_base | world_model | 2h 2m | 0.040 | 0.007 | 0.157 |
| diffusion_dim256 | diffusion | 4h 39m | 0.048 | 0.008 | 0.174 |
| diffusion_base | diffusion | 6h 13m | 0.073 | 0.009 | 0.178 |

The flow matching loss values are not directly comparable to the DDPM loss values, since they measure different quantities (velocity-prediction MSE versus noise-prediction MSE).

**Flow matching matches or beats the best DDPM world model on KID, with roughly a tenth of the sampling steps.** The two `world_flow` rows land at KID 0.102 and 0.103, slightly better than the best DDPM result (0.106 from the pretrained world model). The flow matching runs need only 10 ODE steps at inference against 100 for the DDPM runs. The wall-clock difference at inference is much larger than the small KID gap suggests.

![KID over training: flow matching vs DDPM](/research/worldgen/flow_vs_ddim.png)

**Action conditioning improves both loss and generation quality.** Within the DDPM rows, every conditional `world_*` model lands at lower KID than the unconditional `diffusion_*` runs (0.128–0.157 vs 0.174–0.178), in addition to having lower per-sample loss. The intuition that conditioning narrows the marginal distribution of the model's outputs, and therefore makes coverage worse, was not borne out in this setting.

**Unconditional pretraining transfers to the conditional task.** `world_filmcond_pre` initializes from a previously trained unconditional model rather than from random weights and lands at the best DDPM KID (0.106 vs 0.128 for the equivalent from-scratch run). The unconditional pretraining gives the model a useful prior on map-like images before it is asked to condition on a specific (start, action) pair.

**Classifier-free guidance had a near-zero effect here.** `world_clsfg` is 0.129 vs `world_filmcond`'s 0.128, and `world_flow_clsfg` is 0.102 vs `world_flow_base`'s 0.103. Both differences are within noise. CFG tends to help more when the conditional and unconditional branches differ substantially; in this setting the conditioning information is rich enough that the unconditional branch is far enough from the conditional one that interpolation does not pull the sample meaningfully further.

![Multi-step rollout](/research/worldgen/rollout_example_1.png)

![Original, ground truth, and generated next observation](/research/worldgen/rollout_example_2.png)

## Notes from the process

A few takeaways that informed where this project would go next:

- **Sampling cost is a first-class design dimension.** The 10× reduction in sampling steps from flow matching is more useful than any of the quality differences between architectures here. For a world model that will eventually be queried many times during downstream rollouts, this matters disproportionately.
- **KID alone does not capture what a world model is supposed to do.** Per-sample loss and distribution-level KID can both look reasonable while multi-step rollouts drift or compound errors. Pairing KID with rollout-level metrics (multi-step prediction accuracy, drift over time, perceptual quality at long horizons) seems necessary for any larger version of this.
- **The architecture choices that mattered most were the conditioning ones.** RMSNorm and dimension changes had small effects. The choice between additive conditioning and FiLM, and between DDPM and flow matching, had measurable effects on either quality, sampling cost, or both.

The natural next step is more complex worlds: larger maps with structure that requires reasoning over multiple steps, continuous-valued actions, and a longer-horizon evaluation that exposes where the model's representation of the environment breaks down.

## References

- [Scalable Diffusion Models with Transformers (DiT)](https://arxiv.org/abs/2212.09748)
- [FiLM: Visual Reasoning with a General Conditioning Layer](https://arxiv.org/abs/1709.07871)
- [Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747)
- [Classifier-Free Diffusion Guidance](https://arxiv.org/abs/2207.12598)

Experiments tracked with [Aim](https://aimstack.io/). Code and a deep dive on conditioning and normalization choices are in the [repo](https://github.com/AshisGhosh/worldgen).
