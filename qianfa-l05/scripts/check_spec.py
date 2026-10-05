#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""镜面对账：把 `spec.ts` 里烘进去的盘面数据，与**排盘算法**和**本镜口播**逐条对。

为什么要有这个脚本：画面吃的是 `make_lecture.py` 烘进事件的 `gz`，不是渲染时现算的，
所以生成端算错一个取模，**12 宫里能错 8 宫**，而字幕、音轨、时长全对——肉眼极难发现
（实测踩过：天盘干写成 `% 10`，「巳宫放庚」被算成「戊」）。

三类检查，任一不过就非零退出：

  A. 盘算法：plate → 司天(＝病日支) / 司地(顺数三宫，本宫不算) / 司人(司地阴退阳进) /
     天盘支 / 天盘干。天干是**环数 12 步、再对十天干取模**，先 %12 再 %10。
  B. 口播对账：口播里的「X宫，放Y」必须在 spec 的 tz/tg 事件里一一对上（宫、干支都对）。
  C. 三司签：顺数三宫必须是 1/2/3 落在 司天 +1/+2/+3 宫，第三宫同时带「司地」；
     司天宫必须挂「司天」名签（只挂计步签＝名签被覆盖，不允许）。

用法：
    python3 scripts/check_spec.py [项目根]      # 默认当前目录
"""
import os
import re
import sys

ZHI = '子丑寅卯辰巳午未申酉戌亥'
GAN = '甲乙丙丁戊己庚辛壬癸'
RING = ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰']


def zstep(z, k):
    return RING[(RING.index(z) + k) % 12]


def sidi_of(st):
    return zstep(st, 3)                       # 顺数三宫，本宫不算


def sinren_of(sidi):
    """司地阴退阳进一格：子寅辰午申戌为阳（进），丑卯巳未酉亥为阴（退）。"""
    yang = '子寅辰午申戌'
    return zstep(sidi, 1) if sidi in yang else zstep(sidi, -1)


def tian_tz(yz, sinren):
    """天盘支：以司人宫为起点放年命支，顺时针铺一圈。"""
    return {g: ZHI[(ZHI.index(yz) + RING.index(g) - RING.index(sinren)) % 12] for g in ZHI}


def tian_tg(dg, yz):
    """天盘干：以年命支宫为起点放病日干，**环数 12 步**再对十天干取模。"""
    return {g: GAN[(GAN.index(dg) + (RING.index(g) - RING.index(yz)) % 12) % 10] for g in ZHI}


def parse_spec(path):
    src = open(path, encoding='utf-8').read()
    out = {}
    for m in re.finditer(r"^  (SC\d+): \{(.*)$", src, re.M):
        sid, body = m.group(1), m.group(2)
        plate = re.search(r"plate: \['([^']*)', '([^']*)', '([^']*)', '([^']*)'\]", body)
        sansi = re.search(r"sansi: \['(.)', '(.)', '(.)'\]", body)
        stage = re.search(r"stage: '(\w+)'", body)
        evs = re.findall(r"\{k: '(\w+)'(.*?)\}", body)
        events = []
        for k, rest in evs:
            e = {'k': k}
            for key in ('zhi', 'gz', 'text', 'tone'):
                mm = re.search(r"%s: \"([^\"]*)\"" % key, rest)
                if mm:
                    e[key] = mm.group(1)
            events.append(e)
        out[sid] = {'plate': plate.groups() if plate else None,
                    'sansi': sansi.groups() if sansi else None,
                    'stage': stage.group(1) if stage else None, 'events': events}
    return out


def parse_narr(path):
    txt = open(path, encoding='utf-8').read()
    out = {}
    for blk in re.split(r'\n(?=## shot )', txt):
        m = re.match(r'## shot (SC\d+)\n(.*)', blk, re.S)
        if m:
            out[m.group(1)] = m.group(2).strip()
    return out


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    spec = parse_spec(os.path.join(root, 'src/qianfa/spec.ts'))
    narr = parse_narr(os.path.join(root, 'script/narration.txt'))
    errs, warns, checked = [], [], 0

    for sid, sp in sorted(spec.items()):
        text = narr.get(sid, '')
        plate = sp['plate']
        if sp['sansi']:
            st, si, sr = sp['sansi']
            if sidi_of(st) != si:
                errs.append(f'{sid} 司地错：司天{st} 顺数三宫应为 {sidi_of(st)}，写的是 {si}')
            if sinren_of(si) != sr:
                errs.append(f'{sid} 司人错：司地{si} 阴退阳进应为 {sinren_of(si)}，写的是 {sr}')

        if plate:
            yg, yz, dg, dz = plate
            # A. 三司
            if sidi_of(dz) != (sp['sansi'][1] if sp['sansi'] else None):
                errs.append(f'{sid} 司天≠病日支：病日{dz}，司天写的是 '
                            f'{sp["sansi"][1] if sp["sansi"] else "—"}')
            want_tz = tian_tz(yz, sp['sansi'][2] if sp['sansi'] else '')
            want_tg = tian_tg(dg, yz)
            got_tz = {e['zhi']: e['gz'] for e in sp['events'] if e['k'] == 'tz'}
            got_tg = {e['zhi']: e['gz'] for e in sp['events'] if e['k'] == 'tg'}
            for g, v in got_tz.items():
                if want_tz.get(g) != v:
                    errs.append(f'{sid} 天盘支错：{g}宫 应为 {want_tz.get(g)}，写的是 {v}')
            for g, v in got_tg.items():
                if want_tg.get(g) != v:
                    errs.append(f'{sid} 天盘干错：{g}宫 应为 {want_tg.get(g)}，写的是 {v}')

            # B. 口播对账（同一镜里可能连说几遍，取最后一次）
            for z, g in re.findall(r'([%s])宫，?放([%s])' % (ZHI, ZHI), text):
                checked += 1
                if got_tz.get(z) != g:
                    errs.append(f'{sid} 口播说「{z}宫放{g}」，画面天盘支是 {got_tz.get(z)}')
            for z, g in re.findall(r'([%s])宫，?放([%s])' % (ZHI, GAN), text):
                checked += 1
                if got_tg.get(z) != g:
                    errs.append(f'{sid} 口播说「{z}宫放{g}」，画面天盘干是 {got_tg.get(z)}')

        # C. 三司签
        marks = [e for e in sp['events'] if e['k'] == 'mark']
        if marks:
            named = {e.get('text') for e in marks}
            if '司天' not in named:
                errs.append(f'{sid} 司天宫缺「司天」名签（只有计步签？名签被覆盖了）')
            nums = [e for e in marks if e.get('text') in ('1', '2', '3')]
            if nums and sp['sansi']:
                st = sp['sansi'][0]
                want = {'1': zstep(st, 1), '2': zstep(st, 2), '3': sp['sansi'][1]}
                for e in nums:
                    if want.get(e.get('text')) != e.get('zhi'):
                        errs.append(f'{sid} 顺数计步签错：{e.get("text")} 应落在 '
                                    f'{want.get(e.get("text"))}，写的是 {e.get("zhi")}')
            if '司地' in named and '0' in named:
                warns.append(f'{sid} 同时出现「司地」与「0」——本宫不算别标 0，读起来像从 0 数')

    print(f'对账 {len(spec)} 镜，口播铺盘点 {checked} 处')
    for w in warns:
        print('  ⚠ ' + w)
    for e in errs:
        print('  ✗ ' + e)
    if errs:
        print(f'\n不通过：{len(errs)} 处与排盘算法/口播不符')
        return 1
    print('\n通过：盘面数据与排盘算法、本镜口播全部一致 ✅')
    return 0


if __name__ == '__main__':
    sys.exit(main())
