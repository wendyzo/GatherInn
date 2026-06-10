type SeedBlock = { title: string; duration_minutes: number; description: string };
type SeedTemplate = { eventName: string; blocks: SeedBlock[] };

const TEMPLATES: Array<{ keywords: string[]; template: SeedTemplate }> = [
  {
    keywords: ["workshop", "training", "masterclass", "tutorial", "seminar", "class", "session"],
    template: {
      eventName: "Workshop (seed template)",
      blocks: [
        { title: "Registration & Welcome", duration_minutes: 15, description: "Sign-in, name tags, settle in" },
        { title: "Intro & Housekeeping", duration_minutes: 10, description: "Facilitator intro, agenda overview, wifi/toilet details" },
        { title: "Part 1 — Core Content", duration_minutes: 45, description: "Main teaching block with live demos or slides" },
        { title: "Q&A Break", duration_minutes: 15, description: "Open questions on Part 1 before moving on" },
        { title: "Part 2 — Hands-on Practice", duration_minutes: 40, description: "Participants work through exercises; facilitator circulates" },
        { title: "Group Share-out", duration_minutes: 15, description: "2-3 groups share what they built or learned" },
        { title: "Wrap-up & Next Steps", duration_minutes: 10, description: "Resources, follow-up links, feedback form" },
      ],
    },
  },
  {
    keywords: ["social", "mixer", "gathering", "hangout", "drinks", "dinner", "lunch", "brunch", "picnic", "bbq", "party", "night"],
    template: {
      eventName: "Social Event (seed template)",
      blocks: [
        { title: "Doors Open & Arrivals", duration_minutes: 20, description: "Early arrivals, informal mingling" },
        { title: "Welcome & Icebreakers", duration_minutes: 20, description: "President welcome, quick name-game or trivia round" },
        { title: "Food & Drinks", duration_minutes: 40, description: "Catering served; background music on" },
        { title: "Games / Activity", duration_minutes: 45, description: "Organised activity — trivia, bingo, photo scavenger hunt" },
        { title: "Free Socialising", duration_minutes: 30, description: "Unstructured time; photo opportunities" },
        { title: "Closing Remarks", duration_minutes: 10, description: "Shout-outs, upcoming events, thank sponsors" },
      ],
    },
  },
  {
    keywords: ["agm", "meeting", "election", "committee", "handover", "induction"],
    template: {
      eventName: "AGM / Committee Meeting (seed template)",
      blocks: [
        { title: "Call to Order & Quorum Check", duration_minutes: 10, description: "Confirm attendance meets quorum requirements" },
        { title: "Approval of Previous Minutes", duration_minutes: 10, description: "Ratify last AGM minutes; note any corrections" },
        { title: "President's Report", duration_minutes: 15, description: "Year in review — highlights, challenges, membership numbers" },
        { title: "Treasurer's Report", duration_minutes: 15, description: "Financial summary, budget vs actuals, bank balance" },
        { title: "Committee Reports", duration_minutes: 20, description: "Brief updates from each portfolio" },
        { title: "Motions & Voting", duration_minutes: 25, description: "Constitutional changes, fee setting, special resolutions" },
        { title: "Election of New Committee", duration_minutes: 30, description: "Nominations, speeches (2 min each), secret ballot" },
        { title: "Handover Notes", duration_minutes: 15, description: "Outgoing committee shares key learnings with incoming" },
        { title: "Close & Networking", duration_minutes: 15, description: "Informal drinks; outgoing/incoming committee introductions" },
      ],
    },
  },
  {
    keywords: ["fundraiser", "fundraising", "charity", "bake", "raffle", "auction", "gala"],
    template: {
      eventName: "Fundraiser (seed template)",
      blocks: [
        { title: "Setup & Volunteer Briefing", duration_minutes: 30, description: "Stall setup, cash float, volunteer roles assigned" },
        { title: "Doors Open", duration_minutes: 10, description: "Welcome attendees; explain cause and goal" },
        { title: "Main Activity / Stalls", duration_minutes: 90, description: "Core fundraising activities running concurrently" },
        { title: "Raffle / Auction Close", duration_minutes: 20, description: "Last call for tickets; announce winners" },
        { title: "Total Reveal & Thank You", duration_minutes: 15, description: "Announce amount raised; thank volunteers and donors" },
        { title: "Pack Down", duration_minutes: 20, description: "Stall pack-up, cash count, handover to treasurer" },
      ],
    },
  },
  {
    keywords: ["talk", "speaker", "guest", "panel", "presentation", "lecture", "forum", "keynote"],
    template: {
      eventName: "Speaker / Panel Event (seed template)",
      blocks: [
        { title: "Arrival & Networking", duration_minutes: 20, description: "Attendees arrive; light refreshments" },
        { title: "Welcome & Intro", duration_minutes: 10, description: "Host introduces the society and speaker(s)" },
        { title: "Keynote / Talk", duration_minutes: 40, description: "Main speaker presentation" },
        { title: "Panel Discussion", duration_minutes: 25, description: "Moderated conversation between panellists" },
        { title: "Audience Q&A", duration_minutes: 20, description: "Open floor for questions" },
        { title: "Closing Remarks", duration_minutes: 5, description: "Thank speaker; plug next event" },
        { title: "Post-event Networking", duration_minutes: 30, description: "Informal mingling; speaker available for 1:1s" },
      ],
    },
  },
  {
    keywords: ["hackathon", "competition", "contest", "challenge", "tournament", "quiz", "trivia"],
    template: {
      eventName: "Competition / Hackathon (seed template)",
      blocks: [
        { title: "Check-in & Team Formation", duration_minutes: 20, description: "Registration, name badges, assign teams if needed" },
        { title: "Brief & Rules", duration_minutes: 15, description: "Explain format, judging criteria, and timeline" },
        { title: "Round 1", duration_minutes: 45, description: "First competition block" },
        { title: "Break & Leaderboard Update", duration_minutes: 15, description: "Scores tallied; refreshments" },
        { title: "Round 2", duration_minutes: 45, description: "Second competition block" },
        { title: "Final Round / Tiebreaker", duration_minutes: 30, description: "Top teams compete; audience watches" },
        { title: "Judging & Deliberation", duration_minutes: 15, description: "Judges score final submissions" },
        { title: "Awards & Prizes", duration_minutes: 20, description: "Announce winners; photo with trophies/prizes" },
      ],
    },
  },
  {
    keywords: ["orientation", "welcome", "onboarding", "intro", "freshers", "open", "recruitment"],
    template: {
      eventName: "Orientation / Welcome Event (seed template)",
      blocks: [
        { title: "Welcome & Sign-in", duration_minutes: 15, description: "Greet new members; collect contact details" },
        { title: "Society Overview", duration_minutes: 20, description: "Mission, history, what we do throughout the year" },
        { title: "Meet the Committee", duration_minutes: 15, description: "Each exec does a 1-min intro" },
        { title: "Activity Showcase", duration_minutes: 30, description: "Demos, photos, or videos of past events" },
        { title: "Icebreaker Activity", duration_minutes: 25, description: "Small group activity to help new members connect" },
        { title: "Q&A", duration_minutes: 15, description: "Open questions about the society" },
        { title: "Sign-ups & Socials", duration_minutes: 20, description: "Membership form, WhatsApp group, free networking" },
      ],
    },
  },
];

export function findSeedTemplate(eventName: string): SeedTemplate | null {
  const lower = eventName.toLowerCase();
  for (const { keywords, template } of TEMPLATES) {
    if (keywords.some((kw) => lower.includes(kw))) return template;
  }
  return null;
}
