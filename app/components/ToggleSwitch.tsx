import React from "react";
import styles from "./ToggleSwitch.module.css";


interface ToggleSwitchProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  height?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked = false, onChange, height }) => {
  const id = `toggle-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div
      className={styles.container}
      style={height ? {
        height,
        '--toggle-height': height,
        '--toggle-switch-size': `calc(${height} * 0.7)` ,
        '--toggle-width': `calc(${height} * 2)`
      } as React.CSSProperties : undefined}
    >
      {label}{" "}
      <div className={styles["toggle-switch"]}>
        <input
          type="checkbox"
          className={styles.checkbox}
          name={id}
          id={id}
          checked={checked}
          onChange={e => onChange?.(e.target.checked)}
        />
        <label className={styles.label} htmlFor={id} style={height ? { height: `var(--toggle-height)` } : undefined}>
          <span className={styles.inner} />
          <span className={styles.switch} />
        </label>
      </div>
    </div>
  );
};

export default ToggleSwitch;
