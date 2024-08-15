import { createApi, createStore, sample } from 'effector';
import { createGate } from 'effector-react';
import { UseFormReturn } from 'react-hook-form';

type FormValues = any;
type Form = UseFormReturn<FormValues>;

const DEFAULT_FORM_VALUES = {
    fieldName: 'field',
}

/** Создать Gate для передачи в него инстанса формы в компоненте, созданной с помощью react-hook-form */
export const ComponentGate = createGate<Form>();

const $formState = createStore<Form | null>(null);
export const $externalData = createStore<any | null>(null);

/** Записать инстанс формы в стейт для дальнейшего создания api, чтобы работать с методами формы внутри модели эффектора */
sample({
    source: ComponentGate.state,
    filter: (form) => !!form,
    target: $formState,
});

/** Возможно придется вынести типы для формы */
type Keys = keyof typeof DEFAULT_FORM_VALUES;
type Values = (typeof DEFAULT_FORM_VALUES)[Keys];

/** Пример создания api для использования в модели эффектора из полученного инстанса формы */
const formApi = createApi($formState, {
    setValue: (form, { name, value }: { name: Keys; value: Values }) => {
        form?.setValue(name, value, { shouldDirty: true });
    },
    resetValue: (form, name: Keys) => {
        form?.resetField(name)
    }
});

/** Установка значения поля формы через созданный api в модели при изменении внешних данных */
sample({
    source: $externalData,
    filter: (externalData) => !!externalData?.param,
    fn: ({param}) => ({
        name: 'fieldName',
        value: param,
    }),
    target: formApi.setValue,
});
