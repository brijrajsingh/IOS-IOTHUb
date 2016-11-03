# MAzure

* Generating SAS token for sending Device to Cloud Messages

```sh
http://<host>/sas
```
* Sending device to cloud messages

```sh
var payload = "your payload goes here ";

var options = {

  hostname: '<hubname>.azure-devices.net',

  path: '/devices/device-01/messages/events?api-version=2016-02-03',

  method: 'POST',

  headers: {

    'Authorization': <generated sas token>,

    'Content-Length': payload.length,

    'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'

  }

};
```

* Generating SAS token for creating a device Identity

```sh
http://<host>/sas?op=registerdevice
```

* Creating device identity on IOT Hub

```sh
payload =  '{\"deviceId\":\"<deviceIdentity>\"}';

//for creating the device identity
var options = {
  hostname: '<hubName>.azure-devices.net',
  path: '/devices/<deviceIdentity>?api-version=2016-02-03',
  method: 'PUT',
  headers: {
    'Authorization': <generated sas token>,
    'Content-Length': payload.length,
    'Content-Type': 'application/json'
  }
};

```

* IOS Objective C sample to connect with the hub, register the device 

```sh

    +(void) getSASTokenFromWebAppOnCompletion:(GetSAStokenCompletionHandler) completion {
        
        //create a default NSURLConfiguration
        NSURLSessionConfiguration *defaultConfiguration = [NSURLSessionConfiguration defaultSessionConfiguration];
        //create a session
        NSURLSession *session = [NSURLSession sessionWithConfiguration:defaultConfiguration];
        //Define path
        NSString * completePath = @"https://<baseurl>/sas?op=registerdevice";
        //create a URL request
        NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:[NSURL URLWithString:completePath] cachePolicy:NSURLRequestReloadIgnoringLocalCacheData timeoutInterval:60];
        //customize the url request
        [request setHTTPMethod:@"GET"];
        
        NSURLSessionDataTask *fetchTokenTask = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    //        NSLog(@"StatusCode (getSASTokenFromWebAppOnCompletion): %ld",(long)[(NSHTTPURLResponse*)response statusCode]);
            if(error) {
                //error found : Return (nil, error)
                if(completion)
                    completion(nil,error);
            }else {
                //error NOT found : Return (response, nil)
                //check if the status code is 200
                if([(NSHTTPURLResponse*)response statusCode] != 200) {
                    //if status code is not 200 for some weird reason. Then create internal error and send it back to program's main logic for better understanding.
                    NSError *internalError = [[NSError alloc] initWithDomain:@"com.eezytutorials.iosTuts"
                    code:[(NSHTTPURLResponse*)response statusCode] userInfo:@{
                                        NSLocalizedFailureReasonErrorKey:@"LocalizedFailureReason",
                                        NSLocalizedDescriptionKey:@"LocalizedDescription",
                                        NSLocalizedRecoverySuggestionErrorKey:@"LocalizedRecoverySuggestion",
                                        NSLocalizedRecoveryOptionsErrorKey:@"LocalizedRecoveryOptions",
                                        NSRecoveryAttempterErrorKey:@"RecoveryAttempter",
                                        NSHelpAnchorErrorKey:@"HelpAnchor",
                                        NSStringEncodingErrorKey:@"NSStringEncodingError",
                                        NSURLErrorKey:@"NSURLError",
                                        NSFilePathErrorKey:@"NSFilePathError"
                                        }];
                    if(completion)
                        completion(nil,internalError);
                }else {
                    //status code is 200
    //                NSString *responseString = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
                    if (completion) {
                        completion(data,nil);
                    }
                }
            }
        }];
        [fetchTokenTask resume];
    }
    
    +(void) registerDeviceUsingSASToken:(NSData *)sasTokenReceived OnCompletion:(RegisterDeviceCompletionHandler) completion {
    
        NSString *sasTokenString = [[NSString alloc]initWithData:sasTokenReceived encoding:NSUTF8StringEncoding];
        NSString *imeiNumber = [SSKeychain passwordForService:@"imei_alternative" account:@"SanketLife"];
        NSLog(@"imeiNumber : %@",imeiNumber);
        if(!imeiNumber)
            imeiNumber = [self createUUID];
        NSLog(@"imeiNumber : %@",imeiNumber);
        
        NSString *requestURI = [NSString stringWithFormat:@"https://<baseurl>/devices/%@?api-version=2016-02-03",imeiNumber];
        NSLog(@"%@",requestURI);
        NSDictionary *jsonDict = [NSDictionary dictionaryWithObject:imeiNumber forKey:@"deviceId"];
        id jsonObject = [NSJSONSerialization dataWithJSONObject:jsonDict options:NSJSONWritingPrettyPrinted error:nil];
        NSString *contentLength = [NSString stringWithFormat:@"%lu",(unsigned long)[jsonObject length]];
        NSMutableURLRequest *urlRequest = [[NSMutableURLRequest alloc]initWithURL:[NSURL URLWithString:requestURI]];
        [urlRequest setHTTPMethod:@"PUT"];
        [urlRequest setValue:sasTokenString forHTTPHeaderField:@"Authorization"];
        [urlRequest setValue:@"application/json; charset=utf-8" forHTTPHeaderField:@"Content-Type"];
        [urlRequest setValue:contentLength forHTTPHeaderField:@"Content-Length"];
        [urlRequest setHTTPBody:jsonObject];
        
        NSLog(@"\n***************************\n%@  %@\n%@\n%@\n***************************",[urlRequest HTTPMethod],[[urlRequest URL] absoluteString],[urlRequest allHTTPHeaderFields],[[NSString alloc]initWithData:[urlRequest HTTPBody] encoding:NSUTF8StringEncoding]);
        
        NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
        [[session dataTaskWithRequest:urlRequest completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    
            if(error) {
                //error found : Return (nil, error)
                if(completion)
                    completion(nil,error);
            }else {
          
                //error NOT found : Return (response, nil)
                //check if the status code is 200
                if([(NSHTTPURLResponse*)response statusCode] != 200) {
                    //if status code is not 200 for some weird reason. Then create internal error and send it back to program's main logic for better understanding.
                    NSError *internalError = [[NSError alloc] initWithDomain:@"com.eezytutorials.iosTuts"
                    code:[(NSHTTPURLResponse*)response statusCode] userInfo:@{
                            NSLocalizedFailureReasonErrorKey:[[(NSHTTPURLResponse*)response allHeaderFields] valueForKey:@"iothub-errorcode"],
                            NSLocalizedDescriptionKey:[[(NSHTTPURLResponse*)response allHeaderFields] valueForKey:@"iothub-errorcode"],
                            NSLocalizedRecoverySuggestionErrorKey:@"Try another Device ID",
                            NSLocalizedRecoveryOptionsErrorKey:@"LocalizedRecoveryOptions",
                            NSRecoveryAttempterErrorKey:@"RecoveryAttempter",
                            NSHelpAnchorErrorKey:@"HelpAnchor",
                            NSStringEncodingErrorKey:@"NSStringEncodingError",
                            NSURLErrorKey:@"NSURLError",
                            NSFilePathErrorKey:@"NSFilePathError"
                            }];
                    if(completion)
                        completion(nil,internalError);
                }else {
                    //status code is 200
                    NSString *responseString = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
                    if (completion) {
                        completion(responseString,nil);
                    }
                }
            }
    
        }] resume];
    }
    
    +(void) sendMessageToEventHubUsingRestAPIUsingDeviceId:(NSString *)deviceID andSASToken:(NSData *)sasTokenReceived {
        
        //Get the sas token in string form
        NSString *sasTokenString = [[NSString alloc]initWithData:sasTokenReceived encoding:NSUTF8StringEncoding];
        //create the Request URI
        NSString *requestURI = [NSString stringWithFormat:@"https://<baseurl>/devices/%@/messages/events?api-version=2016-02-03",deviceID];
        
        //JSON Message to be passed, call the collectVitals function to pack the vitals information in JSON
        NSDictionary *jsonDict = getJSONData();

        id jsonObject = [NSJSONSerialization dataWithJSONObject:jsonDict options:NSJSONWritingPrettyPrinted error:nil];
       //Create the URL Request
        NSMutableURLRequest *urlRequest = [[NSMutableURLRequest alloc]initWithURL:[NSURL URLWithString:requestURI]];
        //customize the url request
        [urlRequest setHTTPMethod:@"POST"];
        [urlRequest setValue:sasTokenString forHTTPHeaderField:@"Authorization"];
        [urlRequest setHTTPBody:jsonObject];
        
        //create a default NSURLConfiguration
        NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
        
        [[session dataTaskWithRequest:urlRequest completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            NSLog(@"data: %@", data);
            NSLog(@"response: %@", response);
            NSLog(@"ERROR %@", error);
        }] resume];
    }
```
