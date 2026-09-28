import { Item, ItemList } from "../../../../interfaces/send/kakao/BrandMessage/BrandMessage";

export class BrandMessageItemBuilder {
    private item: Partial<Item> = {};

    /** 와이드 리스트 요소 */
    setList(list: ItemList[]): this {        
        this.item.list = list;
        return this;
    }

    build(): Item {
        return this.item as Item;
    }
}
