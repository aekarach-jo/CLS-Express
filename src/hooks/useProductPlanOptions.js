import { useIntl } from 'react-intl';

const planOptions = () => {
  const { formatMessage: f } = useIntl();
  const options = [
    { value: 11, label: f({ id: 'dailyPlan.step.step11' }) },
    { value: 111, label: f({ id: 'dailyPlan.step.step111' }) },
    { value: 12, label: f({ id: 'dailyPlan.step.step12' }) },
    { value: 121, label: f({ id: 'dailyPlan.step.step121' }) },
    { value: 13, label: f({ id: 'dailyPlan.step.step13' }) },
    { value: 131, label: f({ id: 'dailyPlan.step.step131' }) },
    { value: 14, label: f({ id: 'dailyPlan.step.step14' }) },
    { value: 141, label: f({ id: 'dailyPlan.step.step141' }) },
    { value: 15, label: f({ id: 'dailyPlan.step.step15' }) },
    { value: 151, label: f({ id: 'dailyPlan.step.step151' }) },
    { value: 28, label: f({ id: 'dailyPlan.step.step28' }) },
    { value: 281, label: f({ id: 'dailyPlan.step.step281' }) },
    { value: 29, label: f({ id: 'dailyPlan.step.step29' }) },
    { value: 291, label: f({ id: 'dailyPlan.step.step291' }) },
    { value: 16, label: f({ id: 'dailyPlan.step.step16' }) },
    { value: 161, label: f({ id: 'dailyPlan.step.step161' }) },
    { value: 17, label: f({ id: 'dailyPlan.step.step17' }) },
    { value: 171, label: f({ id: 'dailyPlan.step.step171' }) },
    { value: 18, label: f({ id: 'dailyPlan.step.step18' }) },
    { value: 181, label: f({ id: 'dailyPlan.step.step181' }) },
    { value: 19, label: f({ id: 'dailyPlan.step.step19' }) },
    { value: 191, label: f({ id: 'dailyPlan.step.step191' }) },
    { value: 20, label: f({ id: 'dailyPlan.step.step20' }) },
    { value: 201, label: f({ id: 'dailyPlan.step.step201' }) },
    { value: 21, label: f({ id: 'dailyPlan.step.step21' }) },
    { value: 211, label: f({ id: 'dailyPlan.step.step211' }) },
    { value: 22, label: f({ id: 'dailyPlan.step.step22' }) },
    { value: 221, label: f({ id: 'dailyPlan.step.step221' }) },
    { value: 27, label: f({ id: 'dailyPlan.step.step27' }) },
    { value: 271, label: f({ id: 'dailyPlan.step.step271' }) },
    { value: 23, label: f({ id: 'dailyPlan.step.step23' }) },
    { value: 231, label: f({ id: 'dailyPlan.step.step231' }) },
    { value: 24, label: f({ id: 'dailyPlan.step.step24' }) },
    { value: 241, label: f({ id: 'dailyPlan.step.step241' }) },
    { value: 25, label: f({ id: 'dailyPlan.step.step25' }) },
    { value: 251, label: f({ id: 'dailyPlan.step.step251' }) },
    { value: 26, label: f({ id: 'dailyPlan.step.step26' }) },
    { value: 261, label: f({ id: 'dailyPlan.step.step261' }) },
  ];

  return options;
};

const useProductPlanOptions = () => {
  return { planOptions };
};

export default useProductPlanOptions;
