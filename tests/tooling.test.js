import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');

const EXPECTED_SKILLS = [
  'ui-ux-pro-max',
  'impeccable',
  'ui-animation-and-stress-test',
  'cro-and-copywriting',
  'seo-and-local-schema',
  'analytics-and-conversions',
  'code-review',
  'playwright-testing',
];

const EXPECTED_DOCS = [
  'docs/tooling/initial-audit.md',
  'docs/tooling/skills-inventory.md',
  'docs/tooling/installation-report.md',
  'docs/tooling/maintenance.md',
];

describe('Antigravity project rules & skills architecture', () => {
  it('has a concise root AGENTS.md under the 24 KB rule limit without frontmatter', () => {
    const agentsPath = join(ROOT, 'AGENTS.md');
    expect(existsSync(agentsPath)).toBe(true);
    const size = statSync(agentsPath).size;
    expect(size).toBeGreaterThan(200);
    expect(size).toBeLessThan(24000);

    const content = readFileSync(agentsPath, 'utf8');
    expect(content.startsWith('---')).toBe(false);
    expect(content).toContain('Vite');
    expect(content).toContain('Supabase');
    expect(content).toContain('.agents/skills/');
  });

  it('has all 8 project-local skills with valid YAML frontmatter and provenance metadata', () => {
    for (const skillName of EXPECTED_SKILLS) {
      const skillPath = join(ROOT, '.agents', 'skills', skillName, 'SKILL.md');
      expect(existsSync(skillPath), `Missing skill: ${skillPath}`).toBe(true);

      const content = readFileSync(skillPath, 'utf8');
      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      expect(fmMatch, `${skillName}/SKILL.md missing YAML frontmatter`).toBeTruthy();

      const frontmatter = fmMatch[1];
      expect(frontmatter).toMatch(new RegExp(`^name:\\s*${skillName}\\b`, 'm'));
      expect(frontmatter).toMatch(/^description:\s*/m);
      expect(content).toContain('Original Source');
    }
  });

  it('has all required tooling documentation files under docs/tooling/', () => {
    for (const relPath of EXPECTED_DOCS) {
      const fullPath = join(ROOT, relPath);
      expect(existsSync(fullPath), `Missing doc: ${relPath}`).toBe(true);
      expect(statSync(fullPath).size).toBeGreaterThan(500);
    }
  });
});
