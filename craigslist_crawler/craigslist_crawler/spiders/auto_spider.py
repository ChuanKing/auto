import scrapy
from datetime import date

class AutoSpider(scrapy.Spider):
    
    # setup spider name
    name = "auto"

    # setup urls
    def start_requests(self):
        with open("urls.txt", "rt") as f:
            start_urls = [url.strip() for url in f.readlines()]
    
        for url in start_urls:
            yield scrapy.Request(url=url, callback=self.parse)
    
    # parse the page
    def parse(self, response):
        for item in response.css(".result-row"):
            region = str(response.request.url).replace("https://", "").split(".")[0]
            detail_url = item.css("a.result-image").attrib['href']
            id = item.attrib['data-pid']
            repose_id = id
            time_stamp = date.today()
            time = item.css("time").attrib['datetime']
            title = item.css(".result-info .result-title::text").get()
            price = item.css(".result-price::text").get()
            location = item.css(".result-hood::text").get()

            # get repose id
            try: repose_id = item.attrib['data-repost-of']
            except: pass
            
            content = dict()
            content["region"] = region
            content["id"] = id
            content["repose_id"] = repose_id
            content["reposed"] = id != repose_id
            content["link"] = detail_url
            content["title"] = title
            content["time_stamp"] = time_stamp
            content["time"] = time
            content["price"] = price
            content["location"] = location
            
            request = scrapy.Request(detail_url, callback = self.parse_detail)

            request.meta['content'] = content

            yield request

        # go next page
        next_page = response.css('div.paginator a.next::attr(href)').get()

        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)

    def parse_detail(self, response):
        content = response.meta['content']
        
        content['detail-title'] = response.css(".postingtitle #titletextonly::text").get()
        content['detail-price'] = response.css(".postingtitle .price::text").get()
        
        content['images'] = []

        for thumb in response.css(".userbody #thumbs a"):
            content['images'].append(thumb.attrib["href"])

        content['attributes'] = dict()

        attrgroup = response.css(".userbody .mapAndAttrs .attrgroup")

        if len(attrgroup) >= 1:
            content['attributes']["name"] = attrgroup[0].css("span b::text").get()

        if len(attrgroup) >= 2:
            for att in response.css(".userbody .mapAndAttrs .attrgroup")[1].css("span"):
                key = att.css("span::text").get()
                key = key.strip().replace(":", "")
                val = att.css("b::text").get()

                content['attributes'][key] = val
        
        content['intro'] = " ".join(response.css("#postingbody::text").getall()).strip()

        yield content

