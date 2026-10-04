export function Icon({ name, size = 20 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h8" /></>,
    note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    cards: <><rect x="4" y="4" width="13" height="15" rx="2" /><path d="M8 8h5M8 12h5M8 16h3" /><path d="M8 2h11a2 2 0 0 1 2 2v13" /></>,
    check: <><path d="m5 12 4 4L19 6" /><path d="M21 12a9 9 0 1 1-2.6-6.4" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 14 4-4 3 2 5-6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" /></>,
    flame: <><path d="M12 22c4.2 0 7-2.7 7-6.7 0-3-1.7-5.2-4.2-7.3.2 2.4-1 3.5-2 3.8C13.6 7.7 11 4.8 8 3c.8 4.7-.2 6.4-2 8.7C4.8 13.2 5 15 5 16c0 3.6 2.7 6 7 6Z" /><path d="M12 22c-1.7-1-2.5-2.4-2.5-4 0-1.4.8-2.5 2-3.5.1 1.4 1 2.1 1.9 2.3.3-1.5 1.2-2.3 2.1-3.3.5 1.3 1 2.4 1 4.1 0 2.2-1.5 3.8-4.5 4.4Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
