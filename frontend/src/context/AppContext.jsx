import { createContext } from "react";
import PropTypes from "prop-types";
import { doctors } from "../assets/assets";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currencySymbol = "$";

  const value = {
    doctors,
    currencySymbol,
  };

  AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
