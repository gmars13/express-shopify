import Shopify, { DataType } from '@shopify/shopify-api';
// import Shopify, {context} from '@lib/shopify'

export default async (req, res) => {
  // Shopify.Context.update({ HOST_NAME: req.headers.host});
  // const params = {
  //     "product": {
  //         "title":"Custom product",
  //         "body_html":"Custom product",
  //         "variants": [{"option1":"First","price":"456.00","sku":"123"}]
  //     }
  // };
  // // `${price.toFixed(2)}`
  // const session = await Shopify.Utils.loadCurrentSession(req, res);
  // const client = new Shopify.Clients.Rest(session.shop, session.accessToken);

  // const data = await client.post({
  //     path: 'products',
  //     data: params,
  //     type: DataType.JSON,
  // });

  // // res.json(data)
  // res.json("Hellos")
  // let res = await fetch("/")
}
export const config = {
    api: {
      bodyParser: false,
    },
}