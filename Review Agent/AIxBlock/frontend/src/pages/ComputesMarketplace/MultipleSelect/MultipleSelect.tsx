import React, { useCallback, useEffect, useRef, useState } from 'react';
import './MultipleSelect.scss'
import Checkbox from '../../../components/Checkbox/Checkbox';
import InputBase from '../../../components/InputBase/InputBase';
import IconArrowLeft from '../../../assets/icons/IconArrowLeft';
import useOnClickOutside from '../../../hooks/useOnClickOutside';
import { SelectedOption } from '../Index';

// interface Option {
//     label: string;
//     id: string;
//     gpu_name: string;
//     price: number;
//     quantity: number;
//     totalPrice: number;
//     ids: string[];
// }

// interface SelectedOption {
//     id: string;
//     gpu_name: string;
//     price: number;
//     quantity: number;
//     totalPrice: number;
//     ids: string[];
// }

interface CheckboxSelectProps {
    options?: SelectedOption[];
    label?: string;
    onHandleSelect: (selectedOptions: SelectedOption[]) => void;
    newGpuPrice?: SelectedOption[]
}

const CheckboxSelect: React.FC<CheckboxSelectProps> = ({ options = [], label, newGpuPrice, onHandleSelect = (selectedOptions: SelectedOption[]) => { } }) => {
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [active, setActive] = useState(false);
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
    const refOptions = useRef<HTMLDivElement | null>(null);
    const handleClickOutside = useCallback(
        (e: MouseEvent) => {
            if (
                refOptions.current &&
                !refOptions.current.contains(e.target as Node)
            ) {
                setActive(false);
            }
        },
        [refOptions]
    );

    useOnClickOutside(refOptions, handleClickOutside);

    useEffect(() => {
      onHandleSelect(selectedOptions);
    }, [selectedOptions, onHandleSelect]);

    useEffect(() => {
        const initialQuantities: { [key: string]: number } = {};
        options.forEach(option => {
            if (option.id) {
                initialQuantities[option.id] = option.quantity || 0;
            }
        });
        setQuantities(initialQuantities);
    }, [options]);

    const toggleOption = (option: SelectedOption) => {
        if (isSelected(option)) {
            setSelectedOptions(prevSelectedOptions =>
                prevSelectedOptions.filter(item => item.id !== option.id)
            );
        } else {
            const updatedOption = {
                ...option,
                totalPrice: option.price * (quantities[option.id] || 0),
                quantity: quantities[option.id] || 1
            };
            setSelectedOptions(prevSelectedOptions => [...prevSelectedOptions, updatedOption]);
        }
    };

    const isSelected = (option: SelectedOption) => {
        return selectedOptions.some(item => item.id === option.id);
    };

    const handleQuantityChange = (optionId: any, newQuantity: string) => {
        const trimmedValue = newQuantity.trim() || '1';
        const parsedQuantity = parseInt(trimmedValue);

        if (!isNaN(parsedQuantity)) {
            const maxQuantity = optionId?.ids?.length || 1;
            const isCheckQuality = parsedQuantity <= maxQuantity
            const quality = isCheckQuality ? parsedQuantity : optionId.ids.length

            setInputValues(prevInputValues => ({
                ...prevInputValues,
                [optionId.id]: quality.toString(),
            }));

            setQuantities(prevQuantities => ({
                ...prevQuantities,
                [optionId.id]: quality,
            }));

            setSelectedOptions(prevSelectedOptions =>
                prevSelectedOptions.map(option =>
                    option.id === optionId.id
                        ? {
                            ...option,
                            quantity: quality,
                            totalPrice: isCheckQuality ? option.price * parsedQuantity : option.price *optionId.ids.length,
                        }
                        : option
                )
            );
        }
    };

    const uniqueOptions = options.reduce((unique: SelectedOption[], current: SelectedOption) => {
        const existingOption = unique.find(option => option.price === current.price);
        if (existingOption) {
            (existingOption.ids ??= []).push(current.id);
        } else {
            unique.push({ ...current, ids: [current.id] });
        }
        return unique;
    }, [] as SelectedOption[]);

    return (
        <div ref={refOptions} className="multiple-select">
            <p className={`title ${active ? 'active' : ''}`} onClick={() => setActive((prev) => !prev)}>{`${options?.length || 1}x ${label}`}
                {!!options.length && <IconArrowLeft />}
            </p>
            {options.length ?
                <ul className={`${active ? 'active' : ''}`}>
                    {options.length ? uniqueOptions.map(option => (
                        <li key={option.id} className={`${!!isSelected(option) ? 'option-checked' : ''}`}>
                            <Checkbox size='sm' label="" onChange={() => toggleOption(option)} checked={isSelected(option)} />
                            <div className='content'>
                                <div className='detail'>
                                    <p className='name'>{option.label}</p>
                                    <p className='price'>{option.price}/hour</p>
                                    <p className='available'>Available card : {(!option?.vast_contract_id && option?.ids?.length && !option?.provider_name) || 1}</p>
                                </div>
                                {option?.ids?.length > 1 && (
                                    <div className='quantity'>
                                        <InputBase
                                            type="number"
                                            value={inputValues[option?.id] || "1"}
                                            onChange={e => handleQuantityChange(option, e.target.value)}
                                            disabled={!isSelected(option)}
                                            allowClear={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </li>
                    )):null }
                </ul>
            : null}
            
        </div>
    );
};

export default CheckboxSelect;

