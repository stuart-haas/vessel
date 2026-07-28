/**
 * Shared logic for the trigger-driven ThoughtEditor.
 *
 * The editor supports three inline triggers that open an autocomplete menu:
 *   @  look up a Bible verse
 *   #  connect an idea / tag
 *   /  run a command
 */

export type TriggerType = '@' | '#' | '/';

export type ActiveToken = {
  trigger: TriggerType;
  query: string;
  /** Index of the trigger character in the text. */
  start: number;
  /** Cursor index (exclusive end of the token). */
  end: number;
};

// A trigger is "active" when it starts a word (beginning of text or after
// whitespace) and the cursor sits at the end of the run of token characters.
const ACTIVE_TOKEN = /(?:^|\s)([@#/])([^\s@#/]*)$/;

export function getActiveToken(text: string, cursor: number): ActiveToken | null {
  const before = text.slice(0, cursor);
  const match = before.match(ACTIVE_TOKEN);
  if (!match) return null;
  const [, trigger, query] = match;
  return {
    trigger: trigger as TriggerType,
    query,
    start: cursor - query.length - 1,
    end: cursor,
  };
}

export type ReplaceResult = { text: string; cursor: number };

/** Replace the active token's range with `insert`, followed by a single space. */
export function replaceToken(
  text: string,
  token: ActiveToken,
  insert: string,
): ReplaceResult {
  const piece = `${insert} `;
  const next = text.slice(0, token.start) + piece + text.slice(token.end);
  return { text: next, cursor: token.start + piece.length };
}

export type SlashCommand = {
  id: string;
  label: string;
  description: string;
  /** Text inserted in place of the `/command` token. */
  insert: string;
};

export function slashCommands(today: string): SlashCommand[] {
  return [
    {
      id: 'date',
      label: "Today's date",
      description: today,
      insert: today,
    },
    {
      id: 'gratitude',
      label: 'Gratitude',
      description: "Start a line of thanks",
      insert: 'Today I am grateful for',
    },
    {
      id: 'prayer',
      label: 'Prayer',
      description: 'Begin a prayer',
      insert: 'Lord,',
    },
    {
      id: 'reflection',
      label: 'Reflection',
      description: 'Reflect on what you read',
      insert: 'What this means for me:',
    },
    {
      id: 'divider',
      label: 'Divider',
      description: 'Insert a horizontal rule',
      insert: '\n———\n',
    },
  ];
}

export function filterCommands(commands: SlashCommand[], query: string): SlashCommand[] {
  const q = query.toLowerCase();
  if (!q) return commands;
  return commands.filter(
    (c) => c.label.toLowerCase().includes(q) || c.id.includes(q),
  );
}
