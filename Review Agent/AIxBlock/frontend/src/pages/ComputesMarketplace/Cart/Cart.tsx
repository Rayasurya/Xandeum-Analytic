import {useMemo, useState} from "react";
import IconClose from "@/assets/icons/IconClose";
import { useUserLayout } from "@/layouts/UserLayout";
import { SelectedOption } from "../Index";
import Select, { DataSelect } from "@/components/Select/Select";
import { compute_types } from "@/constants/computeType";
import InputBase from "@/components/InputBase/InputBase";
import IconDeleteComputes from "@/assets/icons/IconDeleteComputes";
import Button from "@/components/Button/Button";
import {PRICE_FP} from "@/constants/projectConstants";
import {formatFloat} from "@/utils/customFormat";

type TCartProps = {
    selectedCard: SelectedOption[]
    setIsDeposit: (isDeposit: boolean) => void
    onHandleDelete: (id: string) => void
    onHandleChangeHours: (value: string, id: string) => void
    onHandleChangeQuality: (value: string, id: string) => void
    onHandleServices: (value: string, id: string) => void
}

const Cart = ({ selectedCard, setIsDeposit, onHandleDelete, onHandleChangeHours, onHandleChangeQuality, onHandleServices }: TCartProps) => {
    const userLayout = useUserLayout();
    // const [isDisableCheckOut, setIsDisableCheckOut] = useState(true);
    const [updatedSelectedCard, setUpdatedSelectedCard] = useState<SelectedOption[]>(selectedCard);
    const dataSelect = [{ label: compute_types.label, options: compute_types.options }];

    // useEffect(() => {
    //     const storedSelectedCard = localStorage.getItem("selectedCard");
    //     if (storedSelectedCard) {
    //         setUpdatedSelectedCard(JSON.parse(storedSelectedCard));
    //     }
    // }, []); // Empty dependency array to run only once on component mount


    // const updateSelectedCardById = (id: string, updatedData: SelectedOption[]) => {
    //     const updatedCard = selectedCard.map(item => {
    //         if (item.id === id) {
    //             return { ...item, ...updatedData };
    //         }
    //         return item;
    //     });
    //     updatedSelectedCard(updatedCard);
    //     localStorage.setItem("selectedCard", JSON.stringify(updatedCard));
    // }

    const handleHoursChange = (value: string, id: string) => {
        // onHandleChangeQuality(value, id)
    }

    const handleQualityChange = (value: string, id: string) => {
        const updatedCard = updatedSelectedCard.map((card) => {
            if (card.id === id) {
                return { ...card, quantity: parseInt(value) };
            }
            return card;
        });
        setUpdatedSelectedCard(updatedCard);
        localStorage.setItem("selectedCard", JSON.stringify(updatedCard));
        // setIsDisableCheckOut(false);
    }



    // useEffect(() => {
    //     localStorage.setItem("selectedCard", JSON.stringify(updatedSelectedCard));
    // }, [updatedSelectedCard]);


    const getServiceCompute = (value: string) => {
        switch (value) {
            case 'storage':
                return 'Storage';
            case 'model-training':
                return 'Model Training';
            case 'label-tool':
                return 'Labeling Tool';
            default:
                return 'All';
        }
    }

    const canCheckout = useMemo(() => {
      if (selectedCard.length === 0) {
        return false;
      }

      let isValid = true;

      selectedCard.forEach(c => {
        isValid = isValid && (c.quantity > 0 && c.price > 0);
      });

      return isValid;
    }, [selectedCard]);

    return (
        <div className={`cart ${userLayout.isShowCart ? 'isOpen' : ''}`}>
            <div className="cart--header">
                <IconClose onClick={() => { userLayout.setOpenCart(false); }} />
                <p className="cart--header__title">
                    Your cart
                    <span> ( {selectedCard.length || 0} )</span>
                </p>
            </div>
            <div className="cart--txt">
                <p>
                    It's highly recommended to use separate computes for each service. Just a small note: Storage service needs to have big disks. Model training service needs to have GPUs.
                </p>
            </div>
            <div className="cart--block">
                {selectedCard.map((card, index) => {

                    return (
                        <div className="cart--block__item" key={"cart-item-" + card.id}>
                            <div className="info-card">
                                <div className="info-card--wrap">
                                    <div className="col-1">
                                        <div className="title">
                                            {card.label}
                                        </div>
                                        <div className="content">
                                            <Select
                                                key={index}
                                                defaultValue={{ value: card.services, label: getServiceCompute(card.services) }}
                                                data={(dataSelect as DataSelect[]) ?? []}
                                                onChange={(value) => {
                                                    onHandleServices(value.value, card.id)
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-2">
                                        <div className="title">
                                            Hours
                                        </div>
                                        <InputBase
                                          onChange={(e) => {
                                            onHandleChangeHours(e.target.value, card.id);
                                          }}
                                          allowClear={false}
                                          type="number"
                                          className='input-card-custom'
                                          value={String(card.hours)}
                                          readonly={false}
                                        />
                                    </div>
                                    <div className="col-3">
                                        <div className="title">
                                            Quality
                                        </div>
                                        <InputBase
                                          onChange={(e) => {
                                            onHandleChangeQuality(e.target.value, card.id);
                                          }}
                                          allowClear={false}
                                          className='input-card-custom'
                                          value={String(card.quantity)}
                                          disabled={true}
                                        />
                                    </div>
                                </div>
                                <div className="info-card--detail">
                                    Os:&nbsp;
                                    <span>{card.results?.os}&nbsp;</span>
                                    -
                                    Ram:&nbsp;
                                    <span>{card.results?.ram}&nbsp;</span>
                                    -
                                    Disk:&nbsp;
                                    <span>{card.results?.diskType}&nbsp;</span>
                                </div>
                                <div className="info-card--price">
                                    Price Unit:&nbsp;
                                    <span>{formatFloat(card.quantity * card.price * card.hours, PRICE_FP)}&nbsp;{card.tokenSymbol}</span>
                                </div>
                            </div>
                            <div className="actions">
                                <div className="actions-wrap" onClick={() => onHandleDelete(card.id)}>
                                    <IconDeleteComputes />
                                </div>
                            </div>
                        </div>)
                })}
            </div>
            <Button disabled={!canCheckout} className="cart--footer" onClick={() => {
              setIsDeposit(true);
              userLayout.setOpenCart(false);
            }} aria-disabled={!canCheckout}>
                <IconDeleteComputes />
                <p>Check out</p>
            </Button>
        </div>
    )
}

export default Cart;
