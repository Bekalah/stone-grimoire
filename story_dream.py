"""Spin a short visionary tale and save it to text.

This script relies only on Python's standard library.
"""

import argparse
import random
import textwrap

# ---------------------------------------------------------------------------
# Story ingredients drawn from mythic lineages
# ---------------------------------------------------------------------------
HEROES = [
    "a wandering alchemist",
    "the moonlit bard",
    "an exiled angel",
    "the crystal witch",
    "a dreaming architect",
]
QUESTS = [
    "seeks the forgotten sigil of", 
    "must awaken the sleeping tower of",
    "journeys to chart the spiral of",
    "is chosen to guard the prism of",
    "ventures beyond the veil for",
]
RELICS = [
    "emerald memory",
    "echoing thunder",
    "endless dawn",
    "living stone",
    "silent harmony",
]
OUTCOMES = [
    "restoring balance to the realms",
    "summoning a chorus of stars",
    "revealing the map of dreams",
    "unbinding the wheel of time",
    "opening the gates of perception",
]


def craft_story(seed: int | None) -> str:
    """Assemble a tale from the ingredients above."""

    rnd = random.Random(seed)
    hero = rnd.choice(HEROES)
    quest = rnd.choice(QUESTS)
    relic = rnd.choice(RELICS)
    outcome = rnd.choice(OUTCOMES)
    return f"{hero} {quest} {relic}, {outcome}."


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=None, help="random seed for reproducibility")
    parser.add_argument("--output", default="Visionary_Story.txt", help="text file to write")
    args = parser.parse_args()

    story = craft_story(args.seed)
    with open(args.output, "w", encoding="utf-8") as fh:
        fh.write(textwrap.fill(story, width=80))


if __name__ == "__main__":
    main()
