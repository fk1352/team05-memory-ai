import '../privacy/i18n-privacy';
import '../privacy/privacy.css';
import SelectiveForgetting from '../privacy/SelectiveForgetting';

export default function PrivacyPage() {
  return (
    <div className="pv">
      <SelectiveForgetting />
    </div>
  );
}
