function Card({ title, image, imageAlt = "", children, footer, badge }) {
  return (
    <article className="card">
      {image && (
        <div className="card__image" style={{ position: "relative" }}>
          <img src={image} alt={imageAlt || title || "Card image"} />
          {badge && <div className="card__image-badge">{badge}</div>}
        </div>
      )}

      {title && <h2 className="card__title">{title}</h2>}

      <div className="card__body">{children}</div>

      {footer && <div className="card__footer">{footer}</div>}
    </article>
  );
}

export default Card;