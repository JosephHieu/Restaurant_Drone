import type { ReactNode } from 'react';

interface HelmetProps {
    title: string;
    children: ReactNode;
}

const Helmet = (props: HelmetProps) => {
  document.title = "My Pizza -" + props.title;
  return <div className="w-100">{props.children}</div>;
};

export default Helmet;
