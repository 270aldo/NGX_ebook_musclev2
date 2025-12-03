import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

interface PostProcessingEffectsProps {
  intensity?: number;
  bloomIntensity?: number;
  enableChromaticAberration?: boolean;
}

export function PostProcessingEffects({
  intensity = 1,
  bloomIntensity = 0.6,
  enableChromaticAberration = true
}: PostProcessingEffectsProps) {
  return (
    <EffectComposer>
      {/* Bloom - Glow effect on bright areas */}
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={bloomIntensity * intensity}
        mipmapBlur
      />

      {/* Chromatic Aberration - RGB split on edges */}
      {enableChromaticAberration && (
        <ChromaticAberration
          offset={new Vector2(0.0015 * intensity, 0.0015 * intensity)}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0.5}
        />
      )}

      {/* Vignette - Dark edges */}
      <Vignette
        offset={0.3}
        darkness={0.5 * intensity}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Subtle noise for film grain effect */}
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.15 * intensity}
      />
    </EffectComposer>
  );
}
