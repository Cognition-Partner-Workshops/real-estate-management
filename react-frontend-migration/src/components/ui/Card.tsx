import type { ReactElement, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps): ReactElement {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        ${hoverable ? 'transition-shadow hover:shadow-lg cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }: CardHeaderProps): ReactElement {
  return (
    <div className={`px-4 py-3 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

function CardBody({ children, className = '' }: CardBodyProps): ReactElement {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

function CardFooter({ children, className = '' }: CardFooterProps): ReactElement {
  return (
    <div className={`px-4 py-3 border-t border-gray-200 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
