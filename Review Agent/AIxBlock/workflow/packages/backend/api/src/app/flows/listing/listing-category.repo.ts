import { repoFactory } from '../../core/db/repo-factory'
import { ListingCategoryEntity } from './listing-category.entity'

export const listingCategoryRepo = repoFactory(ListingCategoryEntity)