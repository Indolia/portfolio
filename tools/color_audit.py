#!/usr/bin/env python3
import re
import sys
import csv
from pathlib import Path

CSS_PATH = Path('public/src/assets/css/theme.css')

VAR_BLOCK_RE = re.compile(r'(^|\n)\s*(:root|\[data-theme="dark"\])\s*\{([\s\S]*?)\n\}', re.MULTILINE)
MEDIA_DARK_RE = re.compile(r'@media\s*\(prefers-color-scheme:\s*dark\)\s*\{[\s\S]*?:root\s*\{([\s\S]*?)\n\}', re.MULTILINE)
VAR_RE = re.compile(r'--([a-zA-Z0-9\-]+)\s*:\s*([^;]+);')

def parse_vars(block_text):
    vars = {}
    for m in VAR_RE.finditer(block_text):
        name = '--' + m.group(1).strip()
        val = m.group(2).strip()
        vars[name] = val
    return vars

# color parsing utils
HEX_RE = re.compile(r'#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b')
RGBA_RE = re.compile(r'rgba?\(([^)]+)\)')

def parse_color(s):
    s = s.strip()
    m = HEX_RE.search(s)
    if m:
        hexv = m.group(1)
        if len(hexv) == 3:
            r = int(hexv[0]*2,16)
            g = int(hexv[1]*2,16)
            b = int(hexv[2]*2,16)
        else:
            r = int(hexv[0:2],16)
            g = int(hexv[2:4],16)
            b = int(hexv[4:6],16)
        return (r,g,b,1.0)
    m = RGBA_RE.search(s)
    if m:
        parts = [p.strip() for p in m.group(1).split(',')]
        if len(parts) >= 3:
            r = float(parts[0])
            g = float(parts[1])
            b = float(parts[2])
            a = float(parts[3]) if len(parts) >=4 else 1.0
            return (int(r), int(g), int(b), float(a))
    # handle keywords like 'transparent'
    if 'transparent' in s:
        return (0,0,0,0.0)
    # If color-mix or other CSS functions present, try to fallback by extracting hex inside
    m = HEX_RE.search(s)
    if m:
        return parse_color(m.group(0))
    # unknown
    return None

def blend(fg, bg):
    # fg and bg are (r,g,b,a) 0-255 and alpha 0-1
    r1,g1,b1,a1 = fg
    r2,g2,b2,a2 = bg
    a = a1 + a2*(1-a1)
    if a == 0:
        return (0,0,0,0)
    r = (r1*a1 + r2*a2*(1-a1))/a
    g = (g1*a1 + g2*a2*(1-a1))/a
    b = (b1*a1 + b2*a2*(1-a1))/a
    return (int(round(r)),int(round(g)),int(round(b)),a)

def srgb_to_lin(c):
    c = c/255.0
    if c <= 0.03928:
        return c/12.92
    return ((c+0.055)/1.055) ** 2.4

def rel_luminance(rgb):
    r,g,b = rgb[:3]
    r_lin = srgb_to_lin(r)
    g_lin = srgb_to_lin(g)
    b_lin = srgb_to_lin(b)
    return 0.2126*r_lin + 0.7152*g_lin + 0.0722*b_lin

def contrast_ratio(c1, c2):
    l1 = rel_luminance(c1)
    l2 = rel_luminance(c2)
    L1 = max(l1,l2)
    L2 = min(l1,l2)
    return (L1+0.05)/(L2+0.05)


def load_css_vars(path):
    text = path.read_text()
    root_vars = {}
    dark_vars = {}
    media_dark_vars = {}

    # :root
    m_root = re.search(r':root\s*\{([\s\S]*?)\n\}', text)
    if m_root:
        root_vars = parse_vars(m_root.group(1))

    # data-theme dark
    m_dark = re.search(r'\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}', text)
    if m_dark:
        dark_vars = parse_vars(m_dark.group(1))

    # @media (prefers-color-scheme: dark) :root
    m_media = MEDIA_DARK_RE.search(text)
    if m_media:
        media_dark_vars = parse_vars(m_media.group(1))

    return root_vars, dark_vars, media_dark_vars


def resolve_var(name, vars_map, root_map):
    # check in vars_map then root_map
    if name in vars_map:
        return vars_map[name]
    if name in root_map:
        return root_map[name]
    return None


def to_rgba(value, fallback_bg=None):
    parsed = parse_color(value)
    if not parsed:
        return None
    if parsed[3] < 1.0 and fallback_bg is not None:
        bg_parsed = parse_color(fallback_bg)
        if not bg_parsed:
            # fallback to white
            bg_parsed = (255,255,255,1.0)
        blended = blend(parsed, bg_parsed)
        return blended
    return parsed


PAIRS = [
    ('--text-primary','--main-background-color'),
    ('--text-secondary','--main-background-color'),
    ('--button-primary-text','--button-primary-bg'),
    ('--form-text','--form-bg'),
    ('--table-header-text','--main-background-color'),
    ('--back-btn-color','--back-btn-bg'),
    ('--theme-toggle-color','--theme-toggle-bg'),
    ('--button-text','--button-bg')
]


def analyze_theme(name, vars_map, root_map):
    print('\n=== Theme:', name, '===')
    for fg_var, bg_var in PAIRS:
        fg_val = resolve_var(fg_var, vars_map, root_map)
        bg_val = resolve_var(bg_var, vars_map, root_map)
        if not fg_val:
            print(fg_var, 'NOT FOUND => skipping')
            continue
        if not bg_val or 'transparent' in bg_val or bg_val.strip() == 'transparent':
            # fallback to main background
            bg_val = resolve_var('--main-background-color', vars_map, root_map) or resolve_var('--main-background-color', root_map, {})
            if not bg_val:
                print(bg_var, 'NOT FOUND and no fallback => skipping')
                continue
        fg_rgba = to_rgba(fg_val, bg_val)
        bg_rgba = to_rgba(bg_val)
        if not fg_rgba or not bg_rgba:
            print(f'{fg_var} or {bg_var} could not be parsed (fg: {fg_val} bg: {bg_val})')
            continue
        # if bg has alpha <1, composite over main background as well
        if bg_rgba[3] < 1.0:
            main_bg = resolve_var('--main-background-color', vars_map, root_map)
            main_bg_parsed = parse_color(main_bg) if main_bg else (255,255,255,1.0)
            bg_rgba = blend(bg_rgba, main_bg_parsed)
        cr = contrast_ratio(fg_rgba, bg_rgba)
        aa = cr >= 4.5
        aa_large = cr >= 3.0
        aaa = cr >= 7.0
        aaa_large = cr >= 4.5
        print(f'{fg_var} ({fg_val}) on {bg_var} ({bg_val}) -> contrast: {cr:.2f} : AA(normal)={aa} AA(large)={aa_large} AAA(normal)={aaa} AAA(large)={aaa_large}')


def print_result_line(fg_var, fg_val, bg_var, bg_val, cr, aa, aa_large, aaa, aaa_large):
    status = []
    if aa: status.append('AA')
    if aaa: status.append('AAA')
    if not status:
        status.append('FAIL')
    print(f"- {fg_var} on {bg_var}: {cr:.2f} -> {', '.join(status)} (fg: {fg_val} bg: {bg_val})")


def analyze_theme_full(name, vars_map, root_map):
    print('\n=== Theme audit:', name, '===')
    for fg_var, bg_var in PAIRS:
        fg_val = resolve_var(fg_var, vars_map, root_map)
        bg_val = resolve_var(bg_var, vars_map, root_map)
        if not fg_val:
            print(f'- {fg_var} missing; skipping')
            continue
        if not bg_val or 'transparent' in bg_val or bg_val.strip() == 'transparent':
            bg_val = resolve_var('--main-background-color', vars_map, root_map) or resolve_var('--main-background-color', root_map, {})
            if not bg_val:
                print(f'- {bg_var} missing and no fallback; skipping')
                continue
        fg_rgba = to_rgba(fg_val, bg_val)
        bg_rgba = to_rgba(bg_val)
        if not fg_rgba or not bg_rgba:
            print(f'- {fg_var} or {bg_var} parse failed (fg:{fg_val}, bg:{bg_val})')
            continue
        if bg_rgba[3] < 1.0:
            main_bg = resolve_var('--main-background-color', vars_map, root_map)
            main_bg_parsed = parse_color(main_bg) if main_bg else (255,255,255,1.0)
            bg_rgba = blend(bg_rgba, main_bg_parsed)
        cr = contrast_ratio(fg_rgba, bg_rgba)
        aa = cr >= 4.5
        aa_large = cr >= 3.0
        aaa = cr >= 7.0
        aaa_large = cr >= 4.5
        print_result_line(fg_var, fg_val, bg_var, bg_val, cr, aa, aa_large, aaa, aaa_large)


# Background targets to test against for a full palette audit
PALETTE_BG_TARGETS = [
    '--main-background-color',
    '--form-bg',
    '--button-primary-bg',
    '--theme-toggle-bg',
    '--back-btn-bg'
]


def analyze_palette_full(output_csv_path, root_vars, dark_vars, media_dark_vars):
    # Collect themes to test: (name, vars_map, root_map)
    themes = [
        ('light', root_vars, {}),
    ]
    if dark_vars:
        themes.append(('dark', dark_vars, root_vars))
    if media_dark_vars:
        themes.append(('media-dark', media_dark_vars, root_vars))

    rows = []
    failures = 0

    for theme_name, vars_map, root_map in themes:
        # all variable names available in this theme (merge with root)
        var_names = set(list(root_map.keys()) + list(vars_map.keys()))
        for fg in sorted(var_names):
            fg_val = resolve_var(fg, vars_map, root_map)
            if not fg_val:
                continue
            fg_parsed = parse_color(fg_val)
            if not fg_parsed:
                # try to extract hex inside functions
                fg_parsed = parse_color(fg_val)
            if not fg_parsed:
                continue
            for bg in PALETTE_BG_TARGETS:
                bg_val = resolve_var(bg, vars_map, root_map)
                if not bg_val:
                    continue
                bg_parsed = parse_color(bg_val)
                if not bg_parsed:
                    continue
                # handle alpha blending if needed
                fg_rgba = to_rgba(fg_val, bg_val)
                bg_rgba = to_rgba(bg_val)
                if not fg_rgba or not bg_rgba:
                    continue
                if bg_rgba[3] < 1.0:
                    main_bg = resolve_var('--main-background-color', vars_map, root_map) or resolve_var('--main-background-color', root_map, {})
                    main_bg_parsed = parse_color(main_bg) if main_bg else (255,255,255,1.0)
                    bg_rgba = blend(bg_rgba, main_bg_parsed)
                cr = contrast_ratio(fg_rgba, bg_rgba)
                aa = cr >= 4.5
                aaa = cr >= 7.0
                rows.append({
                    'theme': theme_name,
                    'fg_var': fg,
                    'fg_val': fg_val,
                    'bg_var': bg,
                    'bg_val': bg_val,
                    'contrast': f'{cr:.2f}',
                    'AA': 'PASS' if aa else 'FAIL',
                    'AAA': 'PASS' if aaa else 'FAIL'
                })
                if not aa:
                    failures += 1

    # Write CSV
    outp = Path(output_csv_path)
    outp.parent.mkdir(parents=True, exist_ok=True)
    with outp.open('w', newline='') as csvfile:
        fieldnames = ['theme','fg_var','fg_val','bg_var','bg_val','contrast','AA','AAA']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    # Print summary
    total = len(rows)
    print(f"\nFull palette audit written to {output_csv_path}")
    print(f"Total checks: {total}, Failures (no AA): {failures}")
    # Show top 12 failures
    fails = [r for r in rows if r['AA'] == 'FAIL']
    if fails:
        print('\nTop failures (first 12):')
        for r in fails[:12]:
            print(f"- [{r['theme']}] {r['fg_var']} ({r['fg_val']}) on {r['bg_var']} ({r['bg_val']}) -> {r['contrast']} : AA=FAIL")


SEMANTIC_FG_PATTERNS = [
    # Match variables that are likely used as readable foregrounds
    r'.*-color$',
    r'.*-text$',
    r'^--text',
    r'^--form-text$',
    r'^--button-primary-text$',
    r'^--table-header-text$',
    r'^--dl-title$',
    r'^--theme-toggle-color$',
    r'^--back-btn-color$',
]

import fnmatch

def is_semantic_fg(var_name):
    for p in SEMANTIC_FG_PATTERNS:
        if re.search(p, var_name):
            return True
    return False


def analyze_palette_semantic(root_vars, dark_vars, media_dark_vars):
    print('\n=== Semantic palette audit (focused on text/icons/buttons) ===')
    themes = [
        ('light', root_vars, {}),
    ]
    if dark_vars:
        themes.append(('dark', dark_vars, root_vars))
    if media_dark_vars:
        themes.append(('media-dark', media_dark_vars, root_vars))

    failures = []
    total = 0
    for theme_name, vars_map, root_map in themes:
        var_names = set(list(root_map.keys()) + list(vars_map.keys()))
        # pick semantic fg vars
        fg_vars = [v for v in sorted(var_names) if is_semantic_fg(v)]
        for fg in fg_vars:
            fg_val = resolve_var(fg, vars_map, root_map)
            if not fg_val:
                continue
            for bg in PALETTE_BG_TARGETS:
                bg_val = resolve_var(bg, vars_map, root_map)
                if not bg_val:
                    continue
                fg_rgba = to_rgba(fg_val, bg_val)
                bg_rgba = to_rgba(bg_val)
                if not fg_rgba or not bg_rgba:
                    continue
                if bg_rgba[3] < 1.0:
                    main_bg = resolve_var('--main-background-color', vars_map, root_map) or resolve_var('--main-background-color', root_map, {})
                    main_bg_parsed = parse_color(main_bg) if main_bg else (255,255,255,1.0)
                    bg_rgba = blend(bg_rgba, main_bg_parsed)
                cr = contrast_ratio(fg_rgba, bg_rgba)
                aa = cr >= 4.5
                total += 1
                if not aa:
                    failures.append((theme_name, fg, fg_val, bg, bg_val, cr))

    print(f'Total semantic checks: {total}, Failures: {len(failures)}')
    if failures:
        print('\nSemantic failures: (first 20)')
        for t,fg,fgv,bg,bgv,cr in failures[:20]:
            print(f"- [{t}] {fg} ({fgv}) on {bg} ({bgv}) -> {cr:.2f}")
    else:
        print('No semantic failures found.')
    return failures


if __name__ == '__main__':
    root_vars, dark_vars, media_dark_vars = load_css_vars(CSS_PATH)
    print('Loaded vars: root:', len(root_vars), 'dark:', len(dark_vars), 'media-dark:', len(media_dark_vars))

    # Analyze light (root)
    analyze_theme_full('light (root)', root_vars, {})

    # Analyze dark (data-theme)
    if dark_vars:
        analyze_theme_full('dark (data-theme)', dark_vars, root_vars)
    else:
        print('\nNo [data-theme="dark"] found to analyze')

    # Analyze media dark override if present (this is what initial paint will use when OS prefers dark)
    if media_dark_vars:
        analyze_theme_full('dark (prefers-color-scheme media)', media_dark_vars, root_vars)
    else:
        print('\nNo media prefers-color-scheme dark block found')

    # Run full palette audit and write CSV
    analyze_palette_full('tools/palette_audit.csv', root_vars, dark_vars, media_dark_vars)

    # Run semantic audit for focused actionable items
    analyze_palette_semantic(root_vars, dark_vars, media_dark_vars)
