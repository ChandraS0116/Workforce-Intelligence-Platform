import re

file_path = r'D:\Engineering\Algoleap\Workforce Intelligence Platform\enterprise-orchestration-center.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the theme light
content = content.replace('<html lang="en" class="dark">', '<html lang="en">')

# CSS modifications
content = content.replace('background-color: #0b1120;', 'background-color: #f8fafc;')
content = content.replace('color: #f8fafc;', 'color: #0f172a;')
content = content.replace('background: rgba(30, 41, 59, 0.8);', 'background: rgba(255, 255, 255, 0.9);')
content = content.replace('border: 1px solid rgba(255,255,255,0.05);', 'border: 1px solid rgba(0,0,0,0.1);')
content = content.replace('border-left: 2px dashed rgba(71, 85, 105, 0.4);', 'border-left: 2px dashed rgba(148, 163, 184, 0.6);')
content = content.replace('stroke: #475569;', 'stroke: #cbd5e1;')
content = content.replace('stroke: #10b981;', 'stroke: #059669;')
content = content.replace('bg-[#0b1120]', 'bg-slate-50')
content = content.replace('rgba(255,255,255,0.05) 1px, transparent 1px', 'rgba(0,0,0,0.05) 1px, transparent 1px')
content = content.replace('fill="#1e293b" stroke="#334155"', 'fill="#ffffff" stroke="#cbd5e1"')
content = content.replace('fill="#94a3b8"', 'fill="#475569"')

# Tailwind class replacements
replacements = {
    'bg-slate-950': 'bg-slate-50',
    'bg-slate-900': 'bg-white',
    'bg-slate-850': 'bg-slate-50',
    'bg-slate-800/50': 'bg-slate-100/50',
    'bg-slate-800': 'bg-slate-100',
    'border-slate-800': 'border-slate-200',
    'border-slate-700/50': 'border-slate-300/50',
    'border-slate-700': 'border-slate-300',
    'text-slate-100': 'text-slate-900',
    'text-slate-200': 'text-slate-800',
    'text-slate-300': 'text-slate-600',
    'text-slate-400': 'text-slate-500',
    'text-slate-500': 'text-slate-500',
    'hover:bg-slate-800': 'hover:bg-slate-200',
    'hover:bg-slate-700': 'hover:bg-slate-300',
    'hover:text-white': 'hover:text-slate-900',
    'text-brand-400': 'text-brand-600',
    'text-emerald-400': 'text-emerald-600',
    'text-amber-400': 'text-amber-600',
    'text-red-400': 'text-red-600',
    'border-brand-500 shadow-neon': 'border-brand-500 shadow-lg',
    'bg-brand-500/20': 'bg-brand-100',
    'bg-emerald-500/20': 'bg-emerald-100',
    'bg-amber-500/10': 'bg-amber-100',
    'bg-purple-500/20': 'bg-purple-100',
    'text-emerald-500': 'text-emerald-600',
    'border-l-blue-500': 'border-l-brand-500'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replacements done.')
