import './style.css'

interface ExtraIngredientProps {
  ingredient: string;
  onSelect: (ingredient: string) => void;
  isChecked: boolean;
}

const ExtraIngredient = (props: ExtraIngredientProps) => {
  const { ingredient, onSelect, isChecked } = props;

  return (
    <div className="extraIngredient">
        <label className="container">
            {ingredient}
            <input type="checkbox" checked={isChecked} onChange={() => onSelect(ingredient)}/>
            <span className="checkmark"></span>
        </label>
    </div>
  );
};

export default ExtraIngredient;