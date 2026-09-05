# Dynamic Request Throttling

To help maximize uptime and request handling speed, PubChem web servers employ a dynamic, web-request throttling approach that enforces the [Usage Policies](programmatic-access.md) for programmatic access.  Importantly, during periods of excessive demand, these policies may be dynamically changed to maintain accessibility to all users.  Requests exceeding limits are rejected (HTTP 503 error).  If the user continuously exceeds the limit, they will be blocked for a period of time. An **HTTP 503 STATUS CODE** may be returned when the server is temporarily unable to service your request due to maintenance downtime or capacity problems. (Please try again later.) Please also note that an HTML document may be returned.

Therefore, the user should moderate the speed at which requests are sent to PubChem, according to the traffic status of PubChem and the extent to which the user is approaching limits.  This information is provided in specialized HTTP response headers accompanying all PUG-REST web requests.  For example, the HTTP response header contains a line similar to the following:

X-Throttling-Control: Request Count status: Green (0%), Request Time status: Green (0%), Service status: Green (20%)

The first two status indicators (Request Count and Time statuses) give information on your usage of the service in one of four states:

1.  Green - less than 50% of the permitted request limit has been used
2.  Yellow - between 50% and 75% of the request limit has been used
3.  Red - more than 75% of the request limit has been reached
4.  Black - the limit has been exceeded and requests are being blocked

The third indicator (Service status) shows the concurrent usage of the service in one of four states:

1.  Idle (Green) - Low concurrent usage being applied to the service at present
2.  Moderate (Yellow) - a moderate number of concurrent requests are being handled
3.  Busy (Red) - a significant number of concurrent requests are being handled
4.  Overloaded (Black) - an excessively high number of concurrent requests are being handled

It is important to note that there are many instances of PubChem services running in parallel. Each instance receives traffic from a load balancer, which distributes the requests across the system. Thus, when a stream of requests is sent to PubChem, the responses will be relative to the PubChem server instance handling the request. Because of the load balancing, one server instance can become overloaded while others may not, depending on the overall nature of requests sent to that server. When providing many requests, one should moderate the speed requests are sent to according to the worst-case usage feedback received.  This will prevent uneven rejection of requests by PubChem services.

**NOTE:** PubChem has many ways to download large volumes of information that are more efficient than multiple requests e.g. to PUG REST. There are various download services, and datafiles on the FTP site. See the [download help page](downloads.md) for more information.
    
    
    
## Why do users end up in our block list?  
  
At times, organizations go beyond our usage policies (https://www.ncbi.nlm.nih.gov/home/about/policies/) to such an extent that they could threaten the stability of PubChem as a public resource.  When this happens, PubChem throttles usage by blocking some requests to keep our free services up and running.  
  
When requests are being throttled or blocked, users will usually see a highly visible notification banner on PubChem webpages.  However, some PubChem systems show a terse message, possibly indicating a “503” error of some sort.  No attempt is (currently) made to contact the ‘owner’ of a blocked Internet Protocol (IP) address.  In most cases, the situation resolves itself when the organization notices that they are being blocked and identifies the source of the excessive requests (often a postdoc or novice researcher with their first experience in a High-Performance Computing (HPC) environment).  
  
However, recently with the advent of AI and the increased demand of chemical data from non-academic sectors, some organizations attempt very large-scale scraping of PubChem data in a relatively short period of time. (e.g., millions of IPs a day, spread across millions of subnets involving 100s of millions of web requests.)  Sadly, the PubChem throttling response to such extremes can catch many innocent users in the crossfire.  Often, such data can be bulk downloaded or accessed many records at a time.
  
If a user ends up on our block list, they are prevented from accessing data for a period of time.  If the excessive number of requests does not stop, then the blocking time only grows.  Given that many ‘owners’ of IPs and IP subnets are internet service providers or cloud platforms, it can be challenging for those owners to trace and remediate the source of the traffic.  
  
Please do not send too many requests.  If you do so, you or your organization will get blocked for a period of time.  If you need to download a large amount of data from PubChem, please check if the desired data is available for bulk download at the PubChem FTP site (https://ftp.ncbi.nlm.nih.gov/pubchem/) or [contact PubChem](contact.md).  
  
