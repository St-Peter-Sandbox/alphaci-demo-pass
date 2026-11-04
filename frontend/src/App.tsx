import { useState, type FormEvent } from 'react';
import { loadQuote } from './api';
import type { Quote } from './quote';

const money = (cents: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);

export default function App({ apiBaseUrl = '' }: Readonly<{ apiBaseUrl?: string }>) {
  const [quantity, setQuantity] = useState('2');
  const [price, setPrice] = useState('250');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setQuote(null);
    try {
      const next = await loadQuote({ quantity: Number(quantity), unitPriceCents: Math.round(Number(price) * 100) }, apiBaseUrl);
      setQuote(next);
    } catch {
      setError('Could not calculate this quote. Check the values and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="desk">
      <header><a className="brand" href="/">Order desk</a><span className="workspace">Customer services</span></header>
      <section className="intro"><p className="section-name">Order planning</p><h1>A clear price before you commit.</h1><p>Quote an order in seconds. Orders of 10 or more receive a 10% discount and free delivery.</p></section>
      <div className="quote-layout">
        <form onSubmit={submit} className="quote-form">
          <h2>Your order</h2>
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" type="number" min="1" max="100" step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          <p className="field-note">From 1 to 100 items</p>
          <label htmlFor="price">Unit price (₱)</label>
          <input id="price" type="number" min="0.01" max="1000000" step="0.01" required value={price} onChange={(event) => setPrice(event.target.value)} />
          <button type="submit" disabled={busy}>{busy ? 'Calculating…' : 'Calculate quote'}</button>
          {error && <p role="alert" className="error">{error}</p>}
        </form>
        <section className="receipt" aria-label="Quote summary" aria-live="polite">
          <h2>Quote summary</h2>
          {quote ? <>
            <dl><div><dt>Subtotal</dt><dd>{money(quote.subtotalCents)}</dd></div><div><dt>Bulk discount</dt><dd>{money(quote.discountCents)}</dd></div><div><dt>Delivery</dt><dd>{money(quote.shippingCents)}</dd></div></dl>
            <div className="total"><span>Order total</span><output aria-label="Order total">{money(quote.totalCents)}</output></div>
            <p className="receipt-note">No payment is collected. This quote is an estimate.</p>
          </> : <p className="empty">Enter your order details to see the subtotal, discount and delivery charge.</p>}
        </section>
      </div>
      <footer>Prices in Philippine pesos. Standard delivery is ₱50 for orders below 10 items.</footer>
    </main>
  );
}
