import React from 'react';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { messages } from './messages/messages';

const showedLog = {};

const LangProvider = ({ children }) => {
  const { currentLang } = useSelector((state) => state.lang);
  return (
    <IntlProvider
      locale={currentLang.locale}
      messages={messages[currentLang.locale]}
      onError={(err) => {
        if (process.env.NODE_ENV !== 'development' || showedLog[err.descriptor.id]) {
          return;
        }

        if (err.code === 'MISSING_TRANSLATION') {
          console.warn(`Missing translation : '${err.descriptor.id}'`);
          showedLog[err.descriptor.id] = true;
        } else {
          console.error(err);
        }
      }}
    >
      {children}
    </IntlProvider>
  );
};
export default LangProvider;
