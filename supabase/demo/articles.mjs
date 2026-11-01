// Full-length original Journal articles (numbered sections, image per section).
// Usage: node supabase/demo/articles.mjs   (safe to re-run; replaces bodies of the 12 seeded articles)
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const PHOTOS = ["p000", "p012", "p008", "p004", "p005", "p016", "p006", "p014", "p011", "p010", "p009", "p013", "p015", "p007"];
const img = (i) => `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-media/demo/${PHOTOS[i % PHOTOS.length]}.webp`;

/** s = [title, paragraphs[], bullets?, whatToDo?] */
function build(intro, sections, final, offset = 0) {
  let md = intro.map((p) => p).join("\n\n") + "\n\n";
  sections.forEach(([title, paras, bullets, tip], i) => {
    md += `## ${i + 1}. ${title}\n\n![${title}](${img(i + offset)})\n\n`;
    md += paras.join("\n\n") + "\n\n";
    if (bullets?.length) md += bullets.map((b) => `- ${b}`).join("\n") + "\n\n";
    if (tip) md += `### What to do instead\n${tip}\n\n`;
  });
  md += `## ${sections.length + 1}. Final thoughts\n\n${final.join("\n\n")}\n`;
  return md;
}

const A = {
  "deep-seat-vs-standard-seat-sofa": {
    excerpt: "Seat depth changes how you sit, read and nap. Here is how to choose the depth that suits your body and your routine.",
    mins: 11,
    body: build(
      [
        "Seat depth is one of the least discussed numbers on a sofa listing, yet it decides whether you sit upright with your feet on the floor or sink back with your legs tucked beneath you. Two sofas with the same width and the same fabric can feel completely different simply because one seat is 10 cm deeper than the other.",
        "This guide explains what deep and standard seats actually are, who each one suits, and how to decide before you order.",
      ],
      [
        ["What the difference really means", ["Seat depth is measured from the front edge of the cushion to the backrest. Most standard sofas sit between 50 and 56 cm. Deep-seat designs usually start around 60 cm and can go beyond 70 cm.", "Those few centimetres decide where your back meets the cushion. On a standard seat most adults can sit back with their feet flat. On a deep seat the same person either uses extra cushions or sits with knees raised."], ["Standard seat: about 50–56 cm", "Deep seat: about 60 cm and more", "Back cushions can reduce the usable depth by 10–15 cm"]],
        ["Why deep seats appeal to so many people", ["Deep seats look generous in photos and invite lounging. They make room for sitting cross-legged, curling up with a book, or lying across the sofa for a nap.", "For households where the sofa is the main place to relax in the evening, that freedom is the whole point."]],
        ["Why standard seats often work better than expected", ["A standard seat supports the lower back and lets your feet rest on the floor. That posture is easier for working on a laptop, eating, talking with guests or getting up quickly.", "Many people who choose deep seats for the look end up adding cushions behind them every day."], null, "Sit on a dining chair and note where your knees bend relative to the seat edge. If you rarely tuck your feet up, a standard depth will likely feel better long term."],
        ["Height, leg length and body proportion change everything", ["The same sofa feels different to a 160 cm and a 190 cm person. Shorter people often find deep seats leave their legs dangling, while taller people may find standard seats cut off support under the thighs."], ["Under about 165 cm: standard depth is usually more comfortable", "165–180 cm: either works — choose by habit", "Over 180 cm: deep seats often feel more natural"]],
        ["Deep seats suit some habits, not all", ["If you lounge sideways, nap often or share the sofa with children and pets, a deep seat earns its space. If you mostly sit upright, it can feel like you are always sliding back."]],
        ["Room size matters as much as comfort", ["A deep seat adds depth to the whole sofa, not just the cushion. In a small living room those extra centimetres can block walkways or crowd a coffee table."], ["Leave at least 45 cm between the sofa and a coffee table", "Keep main walkways around 80–90 cm wide"]],
        ["Cushion construction changes the effective depth", ["Loose back cushions, firm foam backs and plush fibre fills all change how deep a seat feels. A deep frame with thick back cushions can sit like a standard seat."], null, "Ask for the depth measured from the front of the seat to the face of the back cushion, not just the frame."],
        ["Which one is better for everyday life?", ["For most homes where the sofa is used for sitting, talking and watching TV, a standard or slightly deep seat (55–60 cm) is the most versatile. Choose a deep seat when lounging is the main use and the room can take the extra depth."]],
      ],
      ["There is no universally better depth — only a better match for how you sit. Measure your current sofa, notice how you use it for a week, and choose the depth that supports that routine rather than the one that looks best in a photograph."],
      0,
    ),
  },
  "moving-a-sofa-in-montreal": {
    excerpt: "Practical checks for stairs, elevators, parking and upholstery protection before delivery day.",
    mins: 9,
    body: build(
      ["Moving a sofa into an apartment is mostly a measuring exercise. Most delivery problems are not caused by the sofa itself but by a door, a stairwell or an elevator that nobody measured beforehand.", "Use this checklist before you order and again before delivery day."],
      [
        ["Measure the sofa, not just the space", ["Note the sofa's width, depth, height and diagonal depth. The diagonal is the measurement that decides whether a sofa can tilt through a doorway."], ["Width and height of the packed sofa", "Diagonal depth (from the back top corner to the front bottom edge)"]],
        ["Measure every door on the route", ["Measure the narrowest point of each door frame, including the building entrance and the apartment door. Door stops and hinges often take away a few centimetres."], null, "Remove doors from their hinges if the frame is only a little too narrow — it often adds 3–5 cm."],
        ["Check hallways and turns", ["Long sofas struggle with tight corners. Measure the hallway width and the space available where it turns into a room."]],
        ["Stairs and landings", ["Measure stair width, the ceiling height above the stairs, and the size of any landing where the sofa must turn."]],
        ["Elevators", ["Measure the door width, cabin depth and diagonal height of the cabin. Ask the building whether the elevator can be reserved and padded for deliveries."], ["Door width", "Cabin depth", "Cabin diagonal height"]],
        ["Parking and building rules", ["Check where the delivery vehicle can stop and whether the building needs notice for deliveries or a booked time slot."]],
        ["Protect floors and upholstery", ["Lay down floor protection along the route and keep the sofa in its packaging until it reaches the room. Remove sharp objects and rugs from the path."], null, "Prepare the room first: clear space where the sofa will stand so it can be unpacked once, in place."],
      ],
      ["A tape measure and fifteen minutes of preparation prevent most delivery-day surprises. If any measurement is close, contact us before ordering and we'll help you check the fit."],
      2,
    ),
  },
  "why-some-sofas-look-good-online": {
    excerpt: "Photos flatten proportion and fabric. Six details reveal what a listing can't show.",
    mins: 10,
    body: build(
      ["Product photos are designed to make a sofa look its best: wide-angle lenses, perfect lighting and carefully styled rooms. None of that is dishonest, but it can hide the details that decide how a sofa feels to live with.", "Here is what to look for so the sofa that arrives matches the one you imagined."],
      [
        ["Wide lenses change proportions", ["Wide-angle photography makes rooms look bigger and sofas look lower and longer. A sofa can appear more spacious on screen than it feels in a real room."], null, "Rely on the dimension drawing, then mark the sofa's footprint on your floor with tape."],
        ["Lighting changes colour", ["Studio light is bright and even. At home, a beige fabric can look grey under cool light or yellow under warm bulbs."], ["Ask for fabric samples", "Check them in daylight and evening light"]],
        ["Texture disappears in photos", ["Bouclé, chenille and velvet all look smooth at a distance. Up close they feel very different and wear differently."]],
        ["Cushion firmness can't be seen", ["A plump cushion can be soft or firm. Look for the foam density and filling description rather than relying on how full it looks."]],
        ["Seat height and depth decide comfort", ["Two sofas can look identical but differ by 5 cm in seat height and depth — enough to change how you sit every day."]],
        ["Real photos tell the truth", ["Look for customer or in-home photos taken in ordinary rooms. They show scale, colour and texture far more honestly than a studio shot."], null, "Check the 'In real spaces' section on each product page before you decide."],
      ],
      ["A good listing should make a sofa look beautiful and tell you the facts. Read the measurements, ask for samples and look for real-room photos — then the sofa that arrives will feel like the one you chose."],
      4,
    ),
  },
  "how-to-tell-if-a-sofa-will-sag": {
    excerpt: "Softness on day one is not support on day 900. What to check in the frame, springs and foam.",
    mins: 10,
    body: build(
      ["A sofa that sags usually felt perfect in the showroom. Sagging is not caused by one part, but by the way the frame, the support system and the cushions work together over years of use.", "These checks help you judge durability before you buy."],
      [
        ["Start with the frame", ["Solid wood or quality plywood frames hold their shape. Particleboard frames are lighter and cheaper but weaken at the joints."], ["Solid wood or layered plywood", "Reinforced corners and screwed joints"], "Ask what the frame is made of and how the joints are fixed."],
        ["Look at the seat support", ["Serpentine (S-shaped) springs or springs combined with webbing spread weight evenly. Webbing alone can stretch over time, depending on its quality and tension."]],
        ["Check foam density", ["Higher-density foam keeps its shape longer. Low-density foam feels soft at first and then flattens."], ["High-resilience foam recovers quickly", "Layered cushions combine a firm core with a soft top"]],
        ["Fibre and feather fillings", ["Fibre and feather tops add softness but need regular plumping. They are comfortable but will look lived-in sooner."]],
        ["Cushion covers and zippers", ["Removable covers let you rotate and turn cushions, which spreads wear and slows sagging."], null, "Turn and swap seat cushions every few weeks."],
        ["Test it the right way", ["Sit in the same spot for a few minutes, then stand and watch how quickly the cushion recovers. Slow recovery means the foam will flatten sooner."]],
      ],
      ["Durable comfort comes from what you can't see. Ask about the frame, the springs and the foam density, and choose a construction that will still support you years from now."],
      6,
    ),
  },
  "how-to-choose-sofa-depth": {
    excerpt: "The right seat depth depends on how you actually sit. A simple way to measure and decide.",
    mins: 8,
    body: build(
      ["Seat depth is personal. The right depth depends on your height, the way you sit and what else happens on the sofa.", "Use this simple method to find yours."],
      [
        ["Measure your current sofa", ["Measure from the front edge of the seat cushion to the back cushion. Note whether it feels too shallow, about right or too deep."]],
        ["Measure your thigh length", ["Sit on a chair with your back against it and measure from the back of your knee to the backrest. A seat depth close to this number supports you without cutting into your knees."], null, "Add 5–10 cm if you like to lounge, and subtract if you prefer an upright seat."],
        ["Think about your main activity", ["Watching TV and napping favour deeper seats. Conversation, reading and working favour standard ones."], ["Upright use: 50–56 cm", "Mixed use: 56–60 cm", "Lounging: 60 cm and more"]],
        ["Consider everyone who uses it", ["A sofa shared by people of different heights works best at a middle depth, with extra back cushions for anyone who needs them."]],
        ["Don't forget the room", ["Deeper sofas take more floor space. Check walkways and the distance to your coffee table."]],
      ],
      ["The right depth is the one that matches your body and your habits. Measure once, test once, and you'll choose with confidence."],
      8,
    ),
  },
  "what-makes-a-sofa-comfortable": {
    excerpt: "Comfort is the sum of seat height, depth, support and fabric. Here is how each one works.",
    mins: 9,
    body: build(
      ["Comfort is not one feature. It is the balance between how high you sit, how deep the seat is, how the cushions support you and how the fabric feels.", "Understanding each part helps you find the sofa you'll still enjoy in five years."],
      [
        ["Seat height", ["Most comfortable seat heights sit between 42 and 48 cm. Lower seats feel relaxed but are harder to get out of."]],
        ["Seat depth", ["Depth decides whether your back is supported. Match it to your height and the way you like to sit."]],
        ["Back support", ["A supportive backrest meets your lower back and shoulders. Adjustable or reclining backs let each person choose their angle."], null, "Look for adjustable headrests or electric recline if you use the sofa for long evenings."],
        ["Cushion firmness", ["Medium-firm cushions suit most people: soft enough to relax, firm enough to support."], ["Soft: sink-in feel, needs plumping", "Medium: balanced support", "Firm: upright, keeps shape longest"]],
        ["Armrest height and width", ["Armrests should support your arms or head comfortably. Wide, padded arms double as pillows for napping."]],
        ["Fabric feel", ["Breathable fabrics stay comfortable in warm weather. Textured fabrics feel cosy but can be warmer."]],
      ],
      ["A comfortable sofa fits your body and your routine. Test the height, depth, support and fabric together rather than judging by softness alone."],
      10,
    ),
  },
  "7-mistakes-buying-a-sofa-online": {
    excerpt: "Seven common mistakes — from skipping measurements to ignoring delivery access — and how to avoid them.",
    mins: 8,
    body: build(
      ["Buying a sofa online is convenient, but a few avoidable mistakes cause most disappointments.", "Here are the seven we see most often."],
      [
        ["Not measuring the room", ["Mark the footprint with tape and check walkways before you order."]],
        ["Forgetting delivery access", ["Doors, stairs, hallways and elevators must all fit the packed sofa."], null, "Measure the full route, not just the room."],
        ["Choosing colour from a screen", ["Screens change colours. Order fabric samples and check them at home."]],
        ["Ignoring seat height and depth", ["These two numbers decide comfort more than any photo."]],
        ["Overlooking construction", ["Ask about the frame, springs and foam density."]],
        ["Skipping the policies", ["Read the delivery, returns and warranty terms before ordering made-to-order furniture."]],
        ["Rushing the decision", ["Compare a shortlist, read guides and ask questions. A sofa is a long-term purchase."]],
      ],
      ["Most online sofa regrets come from missing information, not bad products. Measure, sample, read the details — and ask us anything before you order."],
      12,
    ),
  },
  "compressed-vs-modular-sofa": {
    excerpt: "Box delivery or piece-by-piece flexibility — two ways to solve a tight entrance.",
    mins: 9,
    body: build(
      ["When a full-size sofa won't fit through the door, compressed and modular sofas both offer a solution — in very different ways.", "Here is how to choose between them."],
      [
        ["What a compressed sofa is", ["Compressed sofas are vacuum-packed and shipped in a box. They expand to full size after unpacking."], ["Easy to carry up stairs", "Usually little or no assembly"]],
        ["What a modular sofa is", ["Modular sofas come as separate sections that connect together. Each piece is smaller and easier to move."]],
        ["Delivery and access", ["Compressed sofas win for very tight access. Modular sofas suit homes where each section fits but the full sofa wouldn't."]],
        ["Flexibility over time", ["Modular sofas can be rearranged, extended or split between rooms. Compressed sofas are usually fixed in shape."], null, "Choose modular if you expect to move house or change layouts."],
        ["Comfort and construction", ["Both can be comfortable. Check foam density and frame materials as you would for any sofa."]],
        ["Which one is better for your home?", ["Choose compressed for the simplest delivery into tight spaces. Choose modular for long-term flexibility."]],
      ],
      ["Both formats solve the same problem in different ways. Start with your access measurements, then decide how much flexibility you want later."],
      1,
    ),
  },
  "modular-corduroy-sofa-bed-review": {
    excerpt: "A full review: dimensions, fabric wear, recline angles and how it sleeps.",
    mins: 8,
    body: build(
      ["This review looks at the Modular Corduroy Sofa Bed with Storage Arms in everyday use: how it sits, how it converts and how the fabric holds up."],
      [
        ["Design and first impressions", ["Soft corduroy channels and rounded arms give it a relaxed look that suits warm, neutral rooms."]],
        ["Modules and layout", ["The sections connect to form a sofa or separate for flexible layouts, which also makes delivery easier."]],
        ["Comfort as a sofa", ["The seat is medium-firm with plush back cushions — comfortable for long evenings."]],
        ["Converting to a bed", ["The sections pull out into a sleeping surface in a few moves, without tools."], null, "Leave enough floor space in front of the sofa for the bed position."],
        ["Storage arms", ["The arms open for blankets and remotes, keeping small rooms tidy."]],
        ["Fabric and care", ["Corduroy is soft and durable. Brush it lightly to keep the pile even."]],
      ],
      ["A flexible, comfortable choice for small homes and guest rooms. See full details, colours and current price on the product page."],
      3,
    ),
  },
  "ultimate-electric-recliner-bed-review": {
    excerpt: "How the electric recliner sofa bed performs: motor, recline range, fabric options and sleeping comfort.",
    mins: 9,
    body: build(
      ["The Electric Recliner Sofa Bed combines a powered recliner and a full-length bed in one compact frame. Here's how it performs in daily use."],
      [
        ["Design and size", ["About 110 cm wide and 100 cm high, extending to around 210 cm — compact enough for apartments."]],
        ["The electric mechanism", ["A handle switch moves the backrest smoothly, driven by a quiet motor on an export-grade steel bracket."]],
        ["Comfort when seated", ["Plush cotton armrests and back cushions give a soft, supportive seat."]],
        ["Comfort when flat", ["Fully extended, it becomes a single sleeping surface with serpentine springs and webbing underneath."], null, "Allow about 210 cm of floor length for the fully flat position."],
        ["Fabric and leather options", ["Choose pet-friendly cat-claw fabric or imported thick leather in a wide range of colours."]],
        ["Frame and durability", ["A solid wood frame resists cracking and squeaking over time."]],
      ],
      ["A strong choice for anyone who wants a recliner by day and a bed at night in limited space. Check models, colours and pricing on the product page."],
      5,
    ),
  },
  "modern-swivel-lounge-chair-review": {
    excerpt: "What to look for in a swivel lounge chair: base, seat comfort and how it fits small rooms.",
    mins: 7,
    body: build(
      ["Swivel lounge chairs are a smart way to add flexible seating to a small room. Here's what to look for."],
      [
        ["Why choose a swivel chair", ["A swivel base lets one chair face the TV, a window or a conversation without moving it."]],
        ["The base", ["A weighted metal base keeps the chair stable and turns smoothly."]],
        ["Seat comfort", ["Look for a medium-firm seat and a back that supports your shoulders."]],
        ["Size and placement", ["Leave clearance around the chair so it can turn freely."], null, "Allow about 15 cm more than the chair's widest point on every side."],
        ["Fabric", ["Textured fabrics hide wear; leather is easy to wipe clean."]],
      ],
      ["A good swivel chair adds comfort and flexibility without taking much space. Compare sizes carefully and choose the base and fabric that suit your room."],
      7,
    ),
  },
  "best-sofa-beds-for-space-saving": {
    excerpt: "How to choose a sofa bed for a small home: mechanism, mattress, size and everyday comfort.",
    mins: 9,
    body: build(
      ["A sofa bed has to be two things at once: a comfortable sofa every day and a good bed when needed. Here's how to choose one for a small home."],
      [
        ["Choose the right mechanism", ["Pull-out, fold-out, click-clack and electric mechanisms all work differently. Choose one you can operate easily."], ["Pull-out: quick and simple", "Fold-out: thicker mattress", "Electric: effortless, at the touch of a switch"]],
        ["Check the sleeping size", ["Measure the open length and width and compare them with how you'll use it."]],
        ["Comfort as a sofa comes first", ["You'll sit on it far more often than you sleep on it. Test seat height and depth."]],
        ["Storage", ["Many sofa beds include storage for bedding — ideal for small homes."], null, "Choose a model with built-in storage so bedding has a home."],
        ["Floor space when open", ["Make sure the open bed fits with room to walk around it."]],
        ["Fabric for everyday use", ["Choose a durable, easy-care fabric if the sofa will be used daily."]],
      ],
      ["The best space-saving sofa bed is the one that's comfortable every day and easy to convert. Explore our convertible sofa beds to compare sizes and mechanisms."],
      9,
    ),
  },
};

for (const [slug, a] of Object.entries(A)) {
  const { error } = await db
    .from("articles")
    .update({ body_en: a.body, excerpt_en: a.excerpt, read_minutes: a.mins, author_name: "AZYLO Editorial", is_demo_copy: true })
    .eq("slug", slug);
  console.log(error ? `${slug}: ${error.message}` : `updated ${slug}`);
}
