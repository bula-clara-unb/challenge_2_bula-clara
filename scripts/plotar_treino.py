"""Gera gráfico da perda (treino x validação) e relatório markdown do fine-tuning LoRA (issue #2).

Uso:
  python scripts/plotar_treino.py \
    --historico modelos/bula-clara-lora/historico_treino.json \
    --resumo modelos/bula-clara-lora/resumo_treino.json \
    --saida resultados
"""
import argparse
import json
import math
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def extrair_series(historico: list[dict]) -> tuple[list[tuple[float, float]], list[tuple[float, float]], list[dict]]:
    treino: list[tuple[float, float]] = []
    validacao: list[tuple[float, float]] = []
    epocas_val: list[dict] = []

    for item in historico:
        step = float(item.get("step", len(treino) + 1))
        if "loss" in item and "eval_loss" not in item:
            treino.append((step, float(item["loss"])))
        if "eval_loss" in item:
            ev = float(item["eval_loss"])
            validacao.append((step, ev))
            epocas_val.append({
                "epoch": item.get("epoch"),
                "step": int(step),
                "eval_loss": ev,
                "perplexidade": round(math.exp(min(ev, 20.0)), 2),
            })
    return treino, validacao, epocas_val


def gerar_svg_perda(
    pontos_treino: list[tuple[float, float]],
    pontos_val: list[tuple[float, float]],
    destino: Path,
) -> Path:
    largura, altura = 800, 460
    ml, mr, mt, mb = 74, 32, 56, 66
    pw = largura - ml - mr
    ph = altura - mt - mb

    todos = [*pontos_treino, *pontos_val]
    if not todos:
        raise ValueError("Histórico não possui pontos de perda para plotar.")

    xs = [p[0] for p in todos]
    ys = [p[1] for p in todos]
    x_min, x_max = min(xs), max(xs)
    y_min, y_max = min(ys), max(ys)
    if x_max == x_min:
        x_max = x_min + 1.0
    pad_y = max((y_max - y_min) * 0.12, 0.05)
    y_lo = max(0.0, y_min - pad_y)
    y_hi = y_max + pad_y

    def sx(x: float) -> float:
        return ml + ((x - x_min) / (x_max - x_min)) * pw

    def sy(y: float) -> float:
        return mt + ph - ((y - y_lo) / (y_hi - y_lo)) * ph

    linhas = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{largura}" height="{altura}" viewBox="0 0 {largura} {altura}">',
        '<rect width="100%" height="100%" fill="#ffffff"/>',
        (
            '<text x="74" y="30" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0B1B33">'
            "Curva de Perda — Fine-tuning LoRA (Bula Clara)</text>"
        ),
    ]

    # Grade horizontal e ticks do eixo Y
    for i in range(5):
        frac = i / 4
        yv = y_lo + frac * (y_hi - y_lo)
        yp = sy(yv)
        linhas.append(f'<line x1="{ml}" y1="{yp:.1f}" x2="{ml + pw}" y2="{yp:.1f}" stroke="#E2E8F0" stroke-width="1"/>')
        linhas.append(
            f'<text x="{ml - 10}" y="{yp + 4:.1f}" text-anchor="end" font-family="Arial, sans-serif" '
            f'font-size="12" fill="#40506A">{yv:.2f}</text>'
        )

    # Eixos
    linhas.append(
        f'<polyline points="{ml},{mt} {ml},{mt + ph} {ml + pw},{mt + ph}" '
        'fill="none" stroke="#6B7A90" stroke-width="1.5"/>'
    )
    linhas.append(
        f'<text x="{ml + pw / 2:.1f}" y="{altura - 18}" text-anchor="middle" '
        'font-family="Arial, sans-serif" font-size="13" fill="#0B1B33">Passos (steps)</text>'
    )
    linhas.append(
        f'<text x="20" y="{mt + ph / 2:.1f}" text-anchor="middle" '
        f'transform="rotate(-90 20 {mt + ph / 2:.1f})" font-family="Arial, sans-serif" font-size="13" fill="#0B1B33">'
        "Perda (Loss)</text>"
    )

    # Ticks do eixo X
    for xv in sorted({x_min, (x_min + x_max) / 2, x_max}):
        xp = sx(xv)
        linhas.append(
            f'<text x="{xp:.1f}" y="{mt + ph + 20}" text-anchor="middle" '
            f'font-family="Arial, sans-serif" font-size="12" fill="#40506A">{round(xv)}</text>'
        )

    if len(pontos_treino) >= 2:
        pts_tr = " ".join(f"{sx(x):.1f},{sy(y):.1f}" for x, y in pontos_treino)
        linhas.append(f'<polyline points="{pts_tr}" fill="none" stroke="#1351B4" stroke-width="2.5"/>')
    for x, y in pontos_treino:
        linhas.append(f'<circle cx="{sx(x):.1f}" cy="{sy(y):.1f}" r="3" fill="#1351B4"/>')

    if len(pontos_val) >= 2:
        pts_va = " ".join(f"{sx(x):.1f},{sy(y):.1f}" for x, y in pontos_val)
        linhas.append(
            f'<polyline points="{pts_va}" fill="none" stroke="#A4221A" stroke-width="2.5" stroke-dasharray="6 4"/>'
        )
    for x, y in pontos_val:
        linhas.append(f'<circle cx="{sx(x):.1f}" cy="{sy(y):.1f}" r="5" fill="#A4221A"/>')

    # Legenda
    lx = ml + pw - 210
    ly = mt + 14
    linhas.append(f'<rect x="{lx}" y="{ly}" width="198" height="52" rx="6" fill="#F8FAFC" stroke="#D6DEEA"/>')
    linhas.append(f'<line x1="{lx + 12}" y1="{ly + 18}" x2="{lx + 36}" y2="{ly + 18}" stroke="#1351B4" stroke-width="2.5"/>')
    linhas.append(f'<text x="{lx + 44}" y="{ly + 22}" font-family="Arial, sans-serif" font-size="12" fill="#0B1B33">Treino (loss)</text>')
    linhas.append(f'<line x1="{lx + 12}" y1="{ly + 38}" x2="{lx + 36}" y2="{ly + 38}" stroke="#A4221A" stroke-width="2.5" stroke-dasharray="6 4"/>')
    linhas.append(f'<circle cx="{lx + 24}" cy="{ly + 38}" r="4" fill="#A4221A"/>')
    linhas.append(f'<text x="{lx + 44}" y="{ly + 42}" font-family="Arial, sans-serif" font-size="12" fill="#0B1B33">Validação (eval_loss)</text>')
    linhas.append("</svg>")

    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text("\n".join(linhas), encoding="utf-8")
    return destino


def gerar_png_perda(
    pontos_treino: list[tuple[float, float]],
    pontos_val: list[tuple[float, float]],
    destino: Path,
) -> Path | None:
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return None

    destino.parent.mkdir(parents=True, exist_ok=True)
    fig, ax = plt.subplots(figsize=(8, 4.6), dpi=150)
    if pontos_treino:
        ax.plot([p[0] for p in pontos_treino], [p[1] for p in pontos_treino], marker="o", linewidth=2, color="#1351B4", label="Treino (loss)")
    if pontos_val:
        ax.plot(
            [p[0] for p in pontos_val],
            [p[1] for p in pontos_val],
            marker="s",
            linestyle="--",
            linewidth=2,
            color="#A4221A",
            label="Validação (eval_loss)",
        )
    ax.set_title("Curva de Perda: Fine-tuning LoRA (Bula Clara)")
    ax.set_xlabel("Passos (steps)")
    ax.set_ylabel("Perda (Loss)")
    ax.grid(True, linestyle=":", alpha=0.6)
    ax.legend()
    fig.tight_layout()
    fig.savefig(destino)
    plt.close(fig)
    return destino


def gerar_relatorio_treino(
    arq_historico: Path,
    pasta_saida: Path,
    arq_resumo: Path | None = None,
) -> dict:
    historico = json.loads(Path(arq_historico).read_text(encoding="utf-8"))
    resumo = json.loads(Path(arq_resumo).read_text(encoding="utf-8")) if arq_resumo and Path(arq_resumo).exists() else {}

    pontos_treino, pontos_val, epocas_val = extrair_series(historico)
    pasta_saida = Path(pasta_saida)
    pasta_saida.mkdir(parents=True, exist_ok=True)

    arq_svg = gerar_svg_perda(pontos_treino, pontos_val, pasta_saida / "grafico_perda_lora.svg")
    arq_png = gerar_png_perda(pontos_treino, pontos_val, pasta_saida / "grafico_perda_lora.png")

    train_loss_final = round(pontos_treino[-1][1], 4) if pontos_treino else None
    eval_loss_final = round(pontos_val[-1][1], 4) if pontos_val else None
    perplexidade_final = round(math.exp(min(eval_loss_final, 20.0)), 2) if eval_loss_final is not None else None

    linhas = ["# Relatório de Treino — LoRA (Bula Clara)", ""]
    if resumo:
        linhas.extend([
            "## Configuração e ambiente",
            "",
            f"- **Modelo base:** `{resumo.get('modelo_base', 'Qwen/Qwen2.5-1.5B-Instruct')}`",
            f"- **Épocas:** {resumo.get('epocas')} · **Rank LoRA:** {resumo.get('rank')} · **LR:** {resumo.get('lr')}",
            f"- **Exemplos:** {resumo.get('exemplos_treino')} treino / {resumo.get('exemplos_validacao')} validação",
            f"- **Dispositivo:** {resumo.get('dispositivo', 'desconhecido')}",
            f"- **Duração:** {resumo.get('duracao_min', '—')} min",
            "",
        ])

    linhas.extend([
        "## Métricas finais",
        "",
        f"- **Perda de treino final (`loss`):** {train_loss_final if train_loss_final is not None else '—'}",
        f"- **Perda de validação final (`eval_loss`):** {eval_loss_final if eval_loss_final is not None else '—'}",
        f"- **Perplexidade de validação:** {perplexidade_final if perplexidade_final is not None else '—'}",
        "",
    ])

    if epocas_val:
        linhas.extend([
            "## Validação por época",
            "",
            "| Época | Step | `eval_loss` | Perplexidade |",
            "|---|---|---|---|",
        ])
        for row in epocas_val:
            linhas.append(f"| {row['epoch']} | {row['step']} | {row['eval_loss']:.4f} | {row['perplexidade']:.2f} |")
        linhas.append("")

    img_nome = arq_png.name if arq_png else arq_svg.name
    linhas.extend([
        "## Gráfico da perda",
        "",
        f"![Curva de perda do treino LoRA]({img_nome})",
        "",
    ])

    arq_md = pasta_saida / "relatorio_treino_lora.md"
    arq_md.write_text("\n".join(linhas), encoding="utf-8")

    return {
        "svg": str(arq_svg),
        "png": str(arq_png) if arq_png else None,
        "relatorio": str(arq_md),
        "train_loss_final": train_loss_final,
        "eval_loss_final": eval_loss_final,
        "perplexidade_final": perplexidade_final,
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Gera gráfico e relatório do treino LoRA a partir do historico_treino.json.")
    ap.add_argument("--historico", type=Path, default=RAIZ / "modelos" / "bula-clara-lora" / "historico_treino.json")
    ap.add_argument("--resumo", type=Path, default=RAIZ / "modelos" / "bula-clara-lora" / "resumo_treino.json")
    ap.add_argument("--saida", type=Path, default=RAIZ / "resultados")
    args = ap.parse_args(argv)

    res = gerar_relatorio_treino(args.historico, args.saida, args.resumo)
    print(f"Relatório gerado em {res['relatorio']} (eval_loss={res['eval_loss_final']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
