// Warm-up and cool-down routines. Edit freely: the timer reads straight from here.
// `cue` is shown on screen and read aloud by the voice guide.
export type Step = { name: string; seconds: number; cue: string };

// ~7 minutes, dynamic (moving) exercises only. Static stretching is saved for after.
export const WARMUP: Step[] = [
  { name: "Brisk walk", seconds: 60, cue: "Walk briskly and swing your arms to raise your heart rate." },
  { name: "Arm circles", seconds: 30, cue: "Big slow circles forwards, then backwards." },
  { name: "Leg swings, forward and back", seconds: 60, cue: "Hold a wall. Swing one leg forward and back, switch legs halfway." },
  { name: "Leg swings, side to side", seconds: 40, cue: "Face the wall and swing each leg across your body, switching halfway." },
  { name: "Walking lunges", seconds: 45, cue: "Long steps, back knee towards the ground, chest tall." },
  { name: "Hip circles", seconds: 30, cue: "Hands on hips, draw big circles in both directions." },
  { name: "Butt kicks", seconds: 30, cue: "Jog on the spot, flicking your heels towards your bum." },
  { name: "High knees", seconds: 30, cue: "Jog on the spot, lifting your knees to hip height." },
  { name: "Ankle hops", seconds: 30, cue: "Small quick bounces on the balls of your feet." },
  { name: "Easy jog", seconds: 60, cue: "Start jogging very gently. You're ready to run!" },
];

// ~4 minutes. Hold each stretch, no bouncing.
export const COOLDOWN: Step[] = [
  { name: "Easy walk", seconds: 90, cue: "Walk slowly and let your breathing settle." },
  { name: "Calf stretch", seconds: 40, cue: "Hands on a wall, one leg back with the heel down. Switch halfway." },
  { name: "Quad stretch", seconds: 40, cue: "Hold one ankle behind you, knees together. Switch halfway." },
  { name: "Hamstring stretch", seconds: 40, cue: "Heel forward on the ground, hinge at your hips. Switch halfway." },
  { name: "Hip flexor stretch", seconds: 40, cue: "Half-kneeling lunge, gently push your hips forward. Switch halfway." },
];
