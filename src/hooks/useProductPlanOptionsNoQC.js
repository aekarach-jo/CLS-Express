import { useIntl } from 'react-intl';

const planOptions = () => {
  const { formatMessage: f } = useIntl();
  const options = [
    { value: 11, label: f({ id: 'dailyPlan.step.step11' }) },
    { value: 12, label: f({ id: 'dailyPlan.step.step12' }) },
    { value: 13, label: f({ id: 'dailyPlan.step.step13' }) },
    { value: 14, label: f({ id: 'dailyPlan.step.step14' }) },
    { value: 15, label: f({ id: 'dailyPlan.step.step15' }) },
    { value: 28, label: f({ id: 'dailyPlan.step.step28' }) },
    { value: 29, label: f({ id: 'dailyPlan.step.step29' }) },
    { value: 26, label: f({ id: 'dailyPlan.step.step26' }) },
    { value: 16, label: f({ id: 'dailyPlan.step.step16' }) },
    { value: 17, label: f({ id: 'dailyPlan.step.step17' }) },
    { value: 18, label: f({ id: 'dailyPlan.step.step18' }) },
    { value: 19, label: f({ id: 'dailyPlan.step.step19' }) },
    { value: 20, label: f({ id: 'dailyPlan.step.step20' }) },
    { value: 21, label: f({ id: 'dailyPlan.step.step21' }) },
    { value: 22, label: f({ id: 'dailyPlan.step.step22' }) },
    { value: 27, label: f({ id: 'dailyPlan.step.step27' }) },
    { value: 23, label: f({ id: 'dailyPlan.step.step23' }) },
    { value: 24, label: f({ id: 'dailyPlan.step.step24' }) },
    { value: 25, label: f({ id: 'dailyPlan.step.step25' }) },
  ];

  return options;
};

const useProductPlanOptionsNoQC = () => {
  return { planOptions };
};

export default useProductPlanOptionsNoQC;
