"use client";

import { Download, Ruler } from "lucide-react";
import { Btn, Eyebrow, H, P, Serif } from "@/components/ui/primitives";

/**
 * Free e-book bonus: "10 steps to choosing and caring for your sofa".
 * A printable page — "Save as PDF" uses the browser's print dialog.
 */
const STEPS: [string, string, string[]][] = [
  [
    "Measure the room before you fall for a design",
    "Mark the sofa's footprint on the floor with masking tape and live with it for a day. You'll know quickly whether it blocks a walkway or crowds the table.",
    ["Leave 75–90 cm for main walkways", "Keep 40–50 cm between the sofa and a coffee table", "For recliners and sofa beds, measure the fully open length too"],
  ],
  [
    "Measure the way in",
    "Most delivery problems happen at the door, not in the room. Measure every door, corridor, staircase and lift the sofa must pass through.",
    ["Note the narrowest door width and height", "Check the turning space at corners and landings", "Compare these with the sofa's packed size, not its assembled size"],
  ],
  [
    "Choose seat depth for the way you sit",
    "Upright sitters are happiest around 50–55 cm of seat depth; people who curl up or nap prefer 60 cm or more. Taller people usually like deeper seats.",
    ["Upright reading and work: 50–55 cm", "Mixed use: 55–60 cm", "Lounging and napping: 60 cm +"],
  ],
  [
    "Pick a fabric for your real life",
    "Children, pets, sunlight and how often you clean matter more than how a fabric looks in a photo.",
    ["Pets: tightly woven or scratch-resistant fabric", "Bright rooms: fade-resistant colours", "Easy cleaning: water-repellent finishes or removable covers"],
  ],
  [
    "Look beneath the cushions",
    "A solid wood frame, springs or webbing that spread weight evenly, and dense foam are what keep a sofa comfortable for years.",
    ["Ask what the frame is made of", "Check the seat support (springs, webbing or both)", "Higher-density foam keeps its shape longer"],
  ],
  [
    "Test the mechanism, if it has one",
    "For recliners and sofa beds, check how smoothly it opens, how much space it needs and where the controls and power cable sit.",
    ["Electric recliners need a nearby socket", "Leave wall clearance for the backrest to move", "Practise opening a sofa bed before guests arrive"],
  ],
  [
    "Place it to protect it",
    "Direct sun fades fabric and dries out leather; radiators and heaters dry out wood and foam.",
    ["Keep 30 cm or more from heaters", "Use curtains or blinds against strong afternoon sun", "Put felt pads under the feet to protect floors"],
  ],
  [
    "Build a weekly 5-minute routine",
    "Small habits do most of the work.",
    ["Vacuum with a soft brush attachment once a week", "Plump and turn loose cushions so they wear evenly", "Wipe leather with a dry microfibre cloth"],
  ],
  [
    "Deal with spills straight away",
    "Blot — never rub — with a clean white cloth, working from the outside of the stain inwards. Test any cleaner on a hidden area first and follow your fabric's care label.",
    ["Blot, don't rub", "Use as little water as possible", "Let it dry naturally, away from direct heat"],
  ],
  [
    "Use your warranty and support",
    "Keep your order number and photos of the sofa when it arrives. If something isn't right, contact us early — small issues are easiest to fix.",
    ["Keep your order confirmation email", "Photograph the sofa on delivery day", "Contact AZYLO support with photos if anything changes"],
  ],
];

export function CareGuide() {
  return (
    <div className="px-4 pb-6 pt-8 md:px-12 print:p-0">
      <div className="mx-auto max-w-[820px]">
        <div className="flex flex-col items-start gap-4 rounded-block bg-dark p-7 text-white md:p-12 print:rounded-none print:bg-white print:p-0 print:text-ink">
          <Eyebrow>AZYLO · Free e-book</Eyebrow>
          <H as="h1" className="text-[32px] text-white md:text-[48px] print:text-ink">
            10 steps to choosing <Serif gold>and caring for your sofa.</Serif>
          </H>
          <P className="text-on-dark-muted print:text-muted">
            A short, practical guide we include with every AZYLO piece — what to measure, what to check, and how to keep your sofa looking new for years.
          </P>
          <Btn kind="white" iconL={Download} onClick={() => window.print()} className="print:hidden">
            Save as PDF
          </Btn>
        </div>

        <ol className="mt-8 flex flex-col gap-4">
          {STEPS.map(([title, body, tips], i) => (
            <li key={title} className="break-inside-avoid rounded-card border border-line2 bg-white p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="text-xl font-extrabold tracking-[-0.01em]">{title}</h2>
              </div>
              <P className="mt-2">{body}</P>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <Ruler size={14} className="mt-0.5 flex-none text-gold" aria-hidden />
                    {tip}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-xs text-faint">© AZYLO · For general guidance; always follow the care label of your product.</p>
      </div>
    </div>
  );
}
