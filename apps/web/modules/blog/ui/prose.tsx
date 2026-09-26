/**
 * Building blocks for article bodies. Semantic HTML (h2/h3, ul/ol, table,
 * blockquote) so search engines and screen readers read the structure.
 */
import type { ReactNode } from "react";
import s from "./blog.module.css";

export function Section({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section id={id} className={s.section} aria-labelledby={`${id}-h`}>
			<h2 id={`${id}-h`}>{title}</h2>
			{children}
		</section>
	);
}

export function H3({ children }: { children: ReactNode }) {
	return <h3>{children}</h3>;
}

export function Bullets({
	items,
}: {
	items: { label: string; text: ReactNode }[];
}) {
	return (
		<ul className={s.bullets}>
			{items.map((i) => (
				<li key={i.label}>
					<strong>{i.label}:</strong> {i.text}
				</li>
			))}
		</ul>
	);
}

export function Callout({ children }: { children: ReactNode }) {
	return <blockquote className={s.callout}>{children}</blockquote>;
}

export function Cards({
	items,
}: {
	items: { title: string; text: ReactNode; highlight?: boolean }[];
}) {
	return (
		<div className={s.cards}>
			{items.map((c) => (
				<div key={c.title} className={c.highlight ? s.cardHighlight : s.card}>
					<p className={s.cardTitle}>{c.title}</p>
					<p>{c.text}</p>
				</div>
			))}
		</div>
	);
}

export function Steps({
	items,
}: {
	items: { title: string; text: ReactNode }[];
}) {
	return (
		<ol className={s.steps}>
			{items.map((i, n) => (
				<li key={i.title}>
					<span aria-hidden="true">{String(n + 1).padStart(2, "0")}</span>
					<div>
						<p className={s.stepTitle}>{i.title}</p>
						<p>{i.text}</p>
					</div>
				</li>
			))}
		</ol>
	);
}

export function DataTable({
	caption,
	head,
	rows,
}: {
	caption: string;
	head: string[];
	rows: ReactNode[][];
}) {
	return (
		<div className={s.tableWrap}>
			<table className={s.table}>
				<caption className="sr-only">{caption}</caption>
				<thead>
					<tr>
						{head.map((h) => (
							<th key={h} scope="col">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static rows
						<tr key={i}>
							{r.map((cell, j) =>
								j === 0 ? (
									// biome-ignore lint/suspicious/noArrayIndexKey: static cells
									<th key={j} scope="row">
										{cell}
									</th>
								) : (
									// biome-ignore lint/suspicious/noArrayIndexKey: static cells
									<td key={j}>{cell}</td>
								),
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
