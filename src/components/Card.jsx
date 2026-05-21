function Card({ title, children, footer }) {
  return (
    <article className="card">
      {title && <h2 className="card__title">{title}</h2>}
      <div className="card__body">{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </article>
  );
}

export default Card;
