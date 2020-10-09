import type {
  GetSiteInfoQuery,
  GetSiteInfoQueryVariables,
} from 'lib/bigcommerce/schema'
import type { RecursivePartial, RecursiveRequired } from '../utils/types'
import { BigcommerceConfig, getConfig } from '..'
import { categoryTreeItemFragment } from '../fragments/category-tree'

// Get 3 levels of categories
export const getSiteInfoQuery = /* GraphQL */ `
  query getSiteInfo {
    site {
      categoryTree {
        ...categoryTreeItem
        children {
          ...categoryTreeItem
          children {
            ...categoryTreeItem
          }
        }
      }
    }
  }
  ${categoryTreeItemFragment}
`

export type CategoriesTree = NonNullable<
  GetSiteInfoQuery['site']['categoryTree']
>

export type GetSiteInfoResult<
  T extends { categories: any[] } = { categories: CategoriesTree }
> = T

async function getSiteInfo(opts?: {
  variables?: GetSiteInfoQueryVariables
  config?: BigcommerceConfig
}): Promise<GetSiteInfoResult>

async function getSiteInfo<T extends { categories: any[] }, V = any>(opts: {
  query: string
  variables?: V
  config?: BigcommerceConfig
}): Promise<GetSiteInfoResult<T>>

async function getSiteInfo({
  query = getSiteInfoQuery,
  variables,
  config,
}: {
  query?: string
  variables?: GetSiteInfoQueryVariables
  config?: BigcommerceConfig
} = {}): Promise<GetSiteInfoResult> {
  config = getConfig(config)
  // RecursivePartial forces the method to check for every prop in the data, which is
  // required in case there's a custom `query`
  const data = await config.fetch<RecursivePartial<GetSiteInfoQuery>>(query, {
    variables,
  })
  const categories = data.site?.categoryTree

  return {
    categories: (categories as RecursiveRequired<typeof categories>) ?? [],
  }
}

export default getSiteInfo