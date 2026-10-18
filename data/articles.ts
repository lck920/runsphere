// Education hub articles. Numbers in [brackets] point to that article's references.
// Sources were checked on 18 Oct 2026. Re-read each source before submitting your project,
// and keep claims cautious: most running/health evidence is observational (association, not proof).
import type { IconName } from "../components/Icon.tsx";

export type Article = {
  slug: string;
  icon: IconName;
  title: string;
  summary: string;
  minutes: number;
  sections: { heading: string; body: string }[];
  references: { text: string; url: string }[];
};

const REF = {
  who: {
    text: "Bull FC, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54(24):1451–1462.",
    url: "https://doi.org/10.1136/bjsports-2020-102955",
  },
  lee: {
    text: "Lee DC, et al. Leisure-time running reduces all-cause and cardiovascular mortality risk. J Am Coll Cardiol. 2014;64(5):472–481.",
    url: "https://doi.org/10.1016/j.jacc.2014.04.058",
  },
  pedisic: {
    text: "Pedisic Z, et al. Is running associated with a lower risk of all-cause, cardiovascular and cancer mortality, and is the more the better? A systematic review and meta-analysis. Br J Sports Med. 2020;54(15):898–905.",
    url: "https://doi.org/10.1136/bjsports-2018-100493",
  },
  lally: {
    text: "Lally P, van Jaarsveld CHM, Potts HWW, Wardle J. How are habits formed: Modelling habit formation in the real world. Eur J Soc Psychol. 2010;40(6):998–1009.",
    url: "https://doi.org/10.1002/ejsp.674",
  },
  parq: {
    text: "Warburton DER, Jamnik VK, Bredin SSD, Gledhill N. The Physical Activity Readiness Questionnaire for Everyone (PAR-Q+) and electronic Physical Activity Readiness Medical Examination (ePARmed-X+). Health Fit J Can. 2011;4(2):3–23. Questionnaire available at eparmedx.com.",
    url: "https://eparmedx.com/",
  },
  videbaek: {
    text: "Videbæk S, Bueno AM, Nielsen RO, Rasmussen S. Incidence of running-related injuries per 1000 h of running in different types of runners: a systematic review and meta-analysis. Sports Med. 2015;45(7):1017–1026.",
    url: "https://doi.org/10.1007/s40279-015-0333-8",
  },
  talk: {
    text: "Reed JL, Pipe AL. The talk test: a useful tool for prescribing and monitoring exercise intensity. Curr Opin Cardiol. 2014;29(5):475–480.",
    url: "https://doi.org/10.1097/HCO.0000000000000097",
  },
  heat: {
    text: "Racinais S, et al. Consensus recommendations on training and competing in the heat. Br J Sports Med. 2015;49(18):1164–1173.",
    url: "https://doi.org/10.1136/bjsports-2015-094915",
  },
  nielsen: {
    text: "Nielsen RO, et al. Excessive progression in weekly running distance and risk of running-related injuries: an association which varies according to type of injury. J Orthop Sports Phys Ther. 2014;44(10):739–747.",
    url: "https://doi.org/10.2519/jospt.2014.5164",
  },
  buist: {
    text: "Buist I, et al. No effect of a graded training program on the number of running-related injuries in novice runners: a randomized controlled trial. Am J Sports Med. 2008;36(1):33–39.",
    url: "https://doi.org/10.1177/0363546507307505",
  },
  fradkin: {
    text: "Fradkin AJ, Zazryn TR, Smoliga JM. Effects of warming-up on physical performance: a systematic review with meta-analysis. J Strength Cond Res. 2010;24(1):140–148.",
    url: "https://doi.org/10.1519/JSC.0b013e3181c643a0",
  },
  schuch: {
    text: "Schuch FB, et al. Physical activity and incident depression: a meta-analysis of prospective cohort studies. Am J Psychiatry. 2018;175(7):631–648.",
    url: "https://doi.org/10.1176/appi.ajp.2018.17111194",
  },
  singh: {
    text: "Singh B, et al. Effectiveness of physical activity interventions for improving depression, anxiety and distress: an overview of systematic reviews. Br J Sports Med. 2023;57(18):1203–1209.",
    url: "https://doi.org/10.1136/bjsports-2022-106195",
  },
  befrienders: {
    text: "Befrienders Kuala Lumpur. 24-hour emotional support helpline.",
    url: "https://www.befrienders.org.my/",
  },
};

export const ARTICLES: Article[] = [
  {
    slug: "why-consistency",
    icon: "calendarCheck",
    title: "Why consistency beats intensity",
    summary: "Why two easy runs every week do more for you than one hard run now and then.",
    minutes: 3,
    sections: [
      {
        heading: "Small and often",
        body: "The World Health Organization recommends that adults do 150–300 minutes of moderate aerobic activity, or 75–150 minutes of vigorous activity, every week, and stresses that some activity is better than none [1]. Two or three short runs a week is a realistic way for a busy student to work towards that.",
      },
      {
        heading: "Even a little running is linked to better health",
        body: "In a study of about 55,000 adults followed for around 15 years, runners had a 30% lower risk of dying from any cause and a 45% lower risk of dying from heart disease than non-runners. The benefit showed up even in people running only 5–10 minutes a day at slow speeds, and was strongest in those who kept running for years [2]. A later review pooling over 230,000 people found any amount of running was linked to a 27% lower risk of early death [3]. These are observational studies, so they show a link rather than proof, but the message is consistent: regular running, even a small amount, is worth it.",
      },
      {
        heading: "Habits take time, and one missed day is fine",
        body: "When university students tried to build a new daily health habit, it took a median of 66 days for it to feel automatic, with a huge range of 18 to 254 days [4]. Missing a single day did not noticeably set people back. So don't panic about a missed run. Just do the next one. That's exactly why RunSphere counts streaks in weeks, not days.",
      },
      {
        heading: "Tips for students",
        body: "Pick the same days every week and tie your run to something you already do, like after your last class. Run with a friend or your hall mates. Log every run here so you can watch your streak and heatmap grow.",
      },
    ],
    references: [REF.who, REF.lee, REF.pedisic, REF.lally],
  },
  {
    slug: "getting-started",
    icon: "footprints",
    title: "Getting started safely",
    summary: "Checking you're ready, run/walk intervals, the talk test and running in Malaysian heat.",
    minutes: 4,
    sections: [
      {
        heading: "Check you're ready",
        body: "Before starting, answer the free PAR-Q+ questionnaire [1]. It asks about things like heart conditions, chest pain, dizziness and medication. If you answer yes to any question, talk to a doctor or your university health centre before you start.",
      },
      {
        heading: "Start with run/walk",
        body: "New runners get injured more often than experienced ones: a review of 13 studies found about 17.8 injuries per 1000 hours of running in novices, compared with 7.7 in recreational runners [2]. That's why RunSphere's plans start with short run/walk intervals (e.g. run 1 minute, walk 2) and build up slowly. Walking breaks let your muscles, tendons and bones adapt, and they're part of the plan, not cheating.",
      },
      {
        heading: "Use the talk test",
        body: "Most of your runs should be easy. A simple check is the talk test: if you can still speak in comfortable sentences, you're likely at a moderate, sustainable effort; if you can't, you're probably working above it [3]. Slow down until you can talk.",
      },
      {
        heading: "Running in the heat",
        body: "Malaysia is hot and humid all year. Experts recommend letting your body adapt to the heat gradually over 1–2 weeks, and starting every session well hydrated [4]. In practice: run early in the morning or after sunset, choose shaded routes, bring water, and stop and cool down if you feel dizzy, sick, confused or get a headache.",
      },
    ],
    references: [REF.parq, REF.videbaek, REF.talk, REF.heat],
  },
  {
    slug: "injury-prevention",
    icon: "bandage",
    title: "Preventing common running injuries",
    summary: "Building up gradually, rest days, warm-ups, and telling pain from tiredness.",
    minutes: 4,
    sections: [
      {
        heading: "Too much, too soon",
        body: "Beginners have a higher injury rate per hour of running than experienced runners [1]. In a year-long study of 874 new runners, those who increased their weekly distance by more than 30% seemed more vulnerable to some overuse injuries (such as runner's knee and shin splints), although the result wasn't statistically certain [2].",
      },
      {
        heading: "The 10% rule: a guard-rail, not magic",
        body: "A popular guideline is to increase your weekly running by no more than about 10%. A trial comparing a slow 13-week plan built on this rule with a standard 8-week plan found no difference in injuries [3], so it's not a guarantee. RunSphere still uses ~10% as a sensible upper limit, combined with rest days and easing off after missed weeks.",
      },
      {
        heading: "Rest days and warm-ups",
        body: "Rest days give your body time to recover and adapt between runs, which is why every RunSphere plan has at least one rest day between runs. Warming up also helps: a systematic review found warm-ups improved performance in most of the outcomes studied [4]. Try the 7-minute guided warm-up before each run.",
      },
      {
        heading: "Pain vs. tiredness",
        body: "General aching and tired legs are normal. Sharp pain, pain that gets worse as you run, pain that makes you limp, or pain that's still there the next morning is not. Stop, rest, and get it checked by a doctor or physiotherapist if it doesn't settle.",
      },
    ],
    references: [REF.videbaek, REF.nielsen, REF.buist, REF.fradkin],
  },
  {
    slug: "mental-health",
    icon: "brain",
    title: "Running for mental health",
    summary: "How running can lift your mood, ease stress and help you through exam season.",
    minutes: 3,
    sections: [
      {
        heading: "Activity and depression",
        body: "A meta-analysis of studies following people over time found that those with higher levels of physical activity were less likely to develop depression later, across all ages and in different regions of the world [1].",
      },
      {
        heading: "Mood, anxiety and stress",
        body: "A large review of 97 reviews (over 1,000 trials and 128,000 people) found physical activity had medium-sized benefits for depression, anxiety and psychological distress compared with usual care [2]. The quality of many included reviews was low, so treat the exact numbers with caution, but the overall direction is encouraging.",
      },
      {
        heading: "Track your own mood",
        body: "Every time you log a run, RunSphere asks how you felt before and after. Your progress page shows your average mood change, so you can see for yourself whether running lifts your mood.",
      },
      {
        heading: "Getting support",
        body: "Running can help, but it isn't a replacement for professional support. If you're struggling, talk to your university counselling service, or call Befrienders KL on 03-7627 2929 (24 hours) [3], Talian Kasih on 15999, or the HEAL line on 15555. In an emergency, call 999.",
      },
    ],
    references: [REF.schuch, REF.singh, REF.befrienders],
  },
];
