import { Container } from "reactstrap";
import "../../../styles/common-section.css";

interface CommonSectionProps {
    title: string;
}

const CommonSection = (props: CommonSectionProps) => {
  return (
    <section className="common__section">
      <Container>
        <h2 className="text-white">{props.title}</h2>
      </Container>
    </section>
  );
};

export default CommonSection;
