import { DbLot, LotType } from '../types';

export function toDbLot(lot: LotType): DbLot {
  return {
    lotNumber: lot.lotNumber,
    lotStatus: lot.lotStatus,
    lotName: lot.lotName,
    lotDescription: lot.lotDescription,
    priceMin: lot.priceMin,
    priceStep: lot.priceStep,
    deposit: lot.deposit,
    currency: lot.currency.name,
    subjectRF: lot.biddingObjectInfo.subjectRF.name,
    estateAddress: lot.biddingObjectInfo.estateAddress,
    category: lot.biddingObjectInfo.category.name,
    characteristics: lot.biddingObjectInfo.characteristics?.map((i) => {
      return {
        name: i.name,
        characteristicValue: i.characteristicValue,
        OKEI: i.OKEI?.name,
      };
    }),
  };
}
