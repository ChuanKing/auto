import scrapy

class AutoDetailSpider(scrapy.Spider):
    name = "auto_detail"
    start_urls = [
        "https://seattle.craigslist.org/tac/cto/d/tacoma-honda-ridgeline-2017/6946543761.html"
    ]
    
    def parse(self, response):
        title = response.css(".postingtitle #titletextonly::text").get()
        price = response.css(".postingtitle .price::text").get()
        
        images = []

        for thumb in response.css(".userbody #thumbs a"):
            images.append(thumb.attrib["href"])

        attributes = dict()

        for att in response.css(".userbody .mapAndAttrs .attrgroup")[1].css("span"):
            key = att.css("span::text").get()
            key = key.strip().replace(":", "")
            val = att.css("b::text").get()

            attributes[key] = val
        
        body = " ".join(response.css("#postingbody::text").getall()).strip()

        yield {
            title: title,
            price: price,
            images: images,
            attributes: attributes,
            body: body
        }
