interface InfoCardProps {
  icon?: string;
  title: string;
  description: string;
  variant?: 'default' | 'highlight';
}

export default function InfoCard({ icon, title, description, variant = 'default' }: InfoCardProps) {
  return (
    <div className={`info-card ${variant === 'highlight' ? 'info-card-highlight' : ''}`}>
      {icon && <div className="info-card-icon">{icon}</div>}
      <h3 className="info-card-title">{title}</h3>
      <p className="info-card-description">{description}</p>
    </div>
  );
}
