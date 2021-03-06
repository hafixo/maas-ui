import { Spinner } from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import { machine as machineActions } from "app/base/actions";
import { machine as machineSelectors } from "app/base/selectors";
import { useToggleMenu } from "app/machines/hooks";
import DoubleRow from "app/base/components/DoubleRow";

export const PowerColumn = ({ onToggleMenu, systemId }) => {
  const dispatch = useDispatch();
  const [updating, setUpdating] = useState(null);
  const machine = useSelector((state) =>
    machineSelectors.getBySystemId(state, systemId)
  );
  const toggleMenu = useToggleMenu(onToggleMenu, systemId);

  const iconClass = classNames({
    "p-icon--power-on": machine.power_state === "on",
    "p-icon--power-off": machine.power_state === "off",
    "p-icon--power-error": machine.power_state === "error",
    "p-icon--power-unknown": machine.power_state === "unknown",
  });

  const menuLinks = [];

  const hasOnAction = machine.actions.includes("on");
  const hasOffAction = machine.actions.includes("off");
  const powerState = machine.power_state;
  if (hasOnAction && powerState !== "on") {
    menuLinks.push({
      children: (
        <>
          <i className="p-icon--power-on"></i>Turn on
        </>
      ),
      onClick: () => {
        dispatch(machineActions.on(systemId));
        setUpdating(machine.power_state);
      },
    });
  }
  if (hasOffAction && powerState !== "off") {
    menuLinks.push({
      children: (
        <>
          <i className="p-icon--power-off"></i>Turn off
        </>
      ),
      onClick: () => {
        dispatch(machineActions.off(systemId));
        setUpdating(machine.power_state);
      },
    });
  }
  if (powerState !== "unknown") {
    menuLinks.push({
      children: (
        <>
          <span className="p-table-menu__icon-space"></span>
          Check power
        </>
      ),
      onClick: () => {
        dispatch(machineActions.checkPower(systemId));
        // Don't display the spinner when checking power as we can't reliably
        // determine that the event has finished.
      },
    });
  }
  if (!hasOnAction && !hasOffAction && powerState === "unknown") {
    menuLinks.push({
      children: "No power actions available",
      disabled: true,
    });
  }

  useEffect(() => {
    if (
      updating !== null &&
      (machine.power_state === "error" || machine.power_state !== updating)
    ) {
      setUpdating(null);
    }
  }, [updating, machine.power_state]);

  return (
    <DoubleRow
      icon={
        updating === null ? (
          <i title={powerState} className={iconClass}></i>
        ) : (
          <Spinner
            className="u-no-margin u-no-padding--left u-no-padding--right"
            inline
          />
        )
      }
      iconSpace={true}
      menuClassName="p-table-menu--hasIcon"
      menuLinks={menuLinks}
      menuTitle="Take action:"
      onToggleMenu={toggleMenu}
      primary={
        <div className="u-upper-case--first u-truncate" data-test="power_state">
          {powerState}
        </div>
      }
      primaryTitle={powerState}
      secondary={
        <div
          className="u-upper-case--first"
          title={machine.power_type}
          data-test="power_type"
        >
          {machine.power_type}
        </div>
      }
      secondaryTitle={machine.power_type}
    />
  );
};

PowerColumn.propTypes = {
  onToggleMenu: PropTypes.func.isRequired,
  systemId: PropTypes.string.isRequired,
};

export default React.memo(PowerColumn);
