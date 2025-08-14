INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at)
VALUES ('admin', '$2b$12$6gRy71JwSypq/NSqHj.fWODy0gC/8nBleQThNzcXX7b1NJkN8vwNu', '8e9de9cd-edaf-4325-a2ef-b225542be2d1', 'admin', NOW(), NOW());

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700023', '$2b$04$SQHFzI.WWc5mXZlENBkKXevcBNUgvSEzgFWo5HDn9PeN7/wMtEo0K', '9f561545-2aee-4065-9e42-9c3765621c4e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.54823820112527, 129.30701143429678, '울산광역시 남구 남산로354번길 26 (신정동)', '내경울산제일병원', ST_GeomFromText('POINT(129.30701143429678 35.54823820112527)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200028', '$2b$04$zrfo4A1ydPgmbdrzs5q2pOKkJN1ixMnW2WWFAd0y24wKzhoo6WbdS', '5f5039ef-8289-4f93-a428-0d1af688d734', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.23602946449906, 129.21649161387128, '부산광역시 기장군 기장읍 대청로72번길 6', '서일기장병원', ST_GeomFromText('POINT(129.21649161387128 35.23602946449906)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400008', '$2b$04$Yqj.RHEFwq4p7zRsNirpEOoAYTsh0SDWosBIcAT/vxwNeDy6kHecu', '2e5011c9-2fee-43f0-a1fe-a31b9cd0f6d4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5089936801167, 126.669478649026, '인천광역시 서구 칠천왕로33번길 17 (석남동, 신석로 70(석남1동, 성민병원))', '성세 뉴성민병원', ST_GeomFromText('POINT(126.669478649026 37.5089936801167)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100019', '$2b$04$hq8/prR6vOzWt5sOhxQGRO9/s64u9TGI0UV.Fr9dUSvv2q5bgd/RG', 'd5ef6139-5093-4271-bdc6-880a51378d0d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.234641294534285, 127.21049868474802, '경기도 용인시 처인구 백옥대로1082번길 18, 다보스종합병원 (김량장동)', '영문다보스병원', ST_GeomFromText('POINT(127.21049868474802 37.234641294534285)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100122', '$2b$04$3Ls9bqRwqnxV1zXRCCsOMOZELHEunFYYlPFew9BTz/vsR1s20slU.', 'cd71bf03-0816-4861-8590-a761999bd8ea', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.240316373, 127.2144914405, '경기도 용인시 처인구 고림로 81 (고림동)', '효심용인서울병원', ST_GeomFromText('POINT(127.2144914405 37.240316373)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300081', '$2b$04$GZr/Z1WHiWKb42ruscDLLueVdsnyN51xLa4G3NNIrhBdkhKZrqv4u', '4e124c64-2479-4ca1-9aa4-1cc0ee839798', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.84022544517349, 128.70573339664242, '대구광역시 수성구 달구벌대로 3190 (신매동, 천주성삼병원)', '(재)미리내천주성삼성직수도회천주성삼병원', ST_GeomFromText('POINT(128.70573339664242 35.84022544517349)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500019', '$2b$04$0Me3rsLBV6QTKRWq4Go.ce9AWCRy.k6yZIPfvutnI7Vz7xKExp23W', 'f7ec2413-b745-4514-89ad-7b7b85b7014b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.197963178976366, 126.83322475289853, '광주광역시 광산구 왕버들로 220 (수완동)', 'KS병원', ST_GeomFromText('POINT(126.83322475289853 35.197963178976366)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300063', '$2b$04$FArl4fSycd/3DNaqqLJxIOcTxuCBMcKi8c.Pqgix3ixFdreIFQtY2', '4e2047d6-d42f-48d2-85d8-96fe6d248360', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.8718797254, 128.6048934753, '대구광역시 중구 동덕로 194 (동인동1가, 동화빌딩)', 'MS재건병원', ST_GeomFromText('POINT(128.6048934753 35.8718797254)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400015', '$2b$04$EOVeuVnvE1hOCveFz.vsS.9PlfE/jxM5dixJIy5y.e6jX0qrWseXm', '7398435f-2fa3-459a-897e-7726534e96f1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.542372653918065, 126.68360486878781, '인천광역시 서구 심곡로100번길 25 (심곡동, 인천국제성모병원)', '가톨릭관동대학교국제성모병원', ST_GeomFromText('POINT(126.68360486878781 37.542372653918065)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400012', '$2b$04$Djh2sysS.W2r.uX8ncBmFOIzdBUPeNQWrhTcFHf5GVDNAq7Lc4rsi', '05bd515d-cb8e-4d4f-bab3-8a68931dc284', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4845586499062, 126.724708130675, '인천광역시 부평구 동수로 56 (부평동)', '가톨릭대학교 인천성모병원', ST_GeomFromText('POINT(126.724708130675 37.4845586499062)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100052', '$2b$04$OTHSgQp3..D05yNoHV1jmuEiInSEqCj8u4jgpeSXPRvM7964dLftK', 'd5b1013d-e1fe-44c6-8921-4c75f5a98ad7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4874477394264, 126.79243459154999, '경기도 부천시 원미구 소사로 327, 가톨릭대학교 부천성모병원 (소사동)', '가톨릭대학교부천성모병원', ST_GeomFromText('POINT(126.79243459154999 37.4874477394264)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100012', '$2b$04$Tlxu.dvvZZwzGGqro.LlO.IaSyTeHA4OArpb6NbMvJI/ogJNu7odS', 'ce3c19ee-7c58-4268-b062-096e9e8e27de', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.27792234538125, 127.02744945028702, '경기도 수원시 팔달구 중부대로 93 (지동)', '가톨릭대학교성빈센트병원', ST_GeomFromText('POINT(127.02744945028702 37.27792234538125)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100011', '$2b$04$R8vqH25t5A.Ouxdmv4yh5..8AiHmk0OScYiE9P3K2u17i/YD6xqIi', 'a0e87b64-3c47-46e8-a9da-ec065e0781c4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.51827233800711, 126.93673129599131, '서울특별시 영등포구 63로 10, 여의도성모병원 (여의도동)', '가톨릭대학교여의도성모병원', ST_GeomFromText('POINT(126.93673129599131 37.51827233800711)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1121013', '$2b$04$wH2gcEPxjQ/GMB5mvBz0NOLshpQOVUXriT/7tTTlagjS0kWQI1U6a', '2467fc05-3acd-4511-9828-e62f6fde6197', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.633608409726854, 126.91615048739686, '서울특별시 은평구 통일로 1021 (진관동)', '가톨릭대학교은평성모병원', ST_GeomFromText('POINT(126.91615048739686 37.633608409726854)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100040', '$2b$04$kxoxwiZyIXUcuv7f8E4oM.ty2jKgizUrN8htZzwpOsHL.CfEYfzTS', '4d9018ad-7380-4d00-900d-edae8f74246a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.75865547828227, 127.07767290194454, '경기도 의정부시 천보로 271, 의정부성모병원 (금오동)', '가톨릭대학교의정부성모병원', ST_GeomFromText('POINT(127.07767290194454 37.75865547828227)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100047', '$2b$04$xNK2/uFbQRKRKYU4xdAfleyZu8bxIuCvdV3ze/BDP1q7ktDYh.5Aa', '00889687-ac85-48a7-8c7f-233245d0bbca', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4856188363947, 126.956781703053, '서울특별시 관악구 관악로 242 (봉천동)', '강남고려병원', ST_GeomFromText('POINT(126.956781703053 37.4856188363947)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100141', '$2b$04$zot5/l8kYcy3IRwzjrHrt.AmXWjFiVBoSZFCLvZWbgYE1tL51YTlC', '31975f4b-3d55-4d3d-b748-6ea68bf5f9ac', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.485612179925724, 127.0395873429168, '서울특별시 강남구 남부순환로 2649, 베드로병원 (도곡동)', '강남베드로병원', ST_GeomFromText('POINT(127.0395873429168 37.485612179925724)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100029', '$2b$04$.PIltPQDEKMLSwgjHICur.vYVsdNKv0D.zj61J5si2CzHXpU6jLYO', '9522d8c9-f5d7-4095-85cd-696de1edac1f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.27377983891884, 127.11140719951389, '경기도 용인시 기흥구 중부대로 411, 강남병원 (신갈동)', '강남병원', ST_GeomFromText('POINT(127.11140719951389 37.27377983891884)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300018', '$2b$04$nk/kjo7Sysqvf7AKhsj0v.4zkjATzLkhYHO9WI0uxqVd62mgSpAuS', 'a4356ea2-fdd3-4152-a1a6-f08b390c1c6e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.88300855242191, 128.66345602650745, '대구광역시 동구 동촌로 207, 강남병원 (방촌동)', '강남종합병원', ST_GeomFromText('POINT(128.66345602650745 35.88300855242191)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100076', '$2b$04$Pg5/ekGxF9784VPu62rTZ.QnT/mt5UICKuvpumkvED9xtwXbmnjbW', '1bc00d29-6b61-4dcc-a93d-32d3d59e929c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4816513439454, 126.911648078471, '서울특별시 관악구 남부순환로 1449, 강남힐병원 (신림동)', '강남힐병원', ST_GeomFromText('POINT(126.911648078471 37.4816513439454)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100043', '$2b$04$5Ykk.6sAi0.Kfd/2P8SYIOH1I01R2FKZLZQEpBpLEs7MUqUizmVZS', '0abebbfe-0ade-41bd-be24-f3a6c6b24693', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5520459324005, 127.157084787845, '서울특별시 강동구 동남로 892 (상일동)', '강동경희대학교의대병원', ST_GeomFromText('POINT(127.157084787845 37.5520459324005)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200008', '$2b$04$vR/YgHeAHG6ucfxtfqO94OnViDZqA1EoXEtNvZgGG70FNEaP94Z9e', 'b9eff0b6-41ad-40d7-bee3-ec348401e1af', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.818426685036066, 128.85771413305145, '강원특별자치도 강릉시 사천면 방동길 38', '강릉아산병원', ST_GeomFromText('POINT(128.85771413305145 37.818426685036066)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800032', '$2b$04$URUjJtg.hv.gILLzDP9mH.rq/c1jyI1zctV1eKNEJmDI3KrLzWFoy', '55b83805-e0c1-4dca-a2a1-7184466835d9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.97415924940364, 128.32528942283565, '경상남도 고성군 고성읍 중앙로 49', '강병원', ST_GeomFromText('POINT(128.32528942283565 34.97415924940364)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100006', '$2b$04$WyfqedAjUjPGtInbHXDtTO1AfkTYRs2S38AmyuB9U7P1wnXkiWCBm', 'c4eec3f2-ccce-4315-9c3e-b7fdfd6a242d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.568497631233825, 126.96793805451702, '서울특별시 종로구 새문안로 29 (평동)', '강북삼성병원', ST_GeomFromText('POINT(126.96793805451702 37.568497631233825)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1121842', '$2b$04$WfD6ZGmAEKOTKRBVFEbXYO2srZrhK.nUrdW9guv3E1WgNefXucpWC', 'a7f35fef-a7f3-451c-846f-4aa25538c7c0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.6254205559935, 127.026184524499, '서울특별시 강북구 도봉로 187, 지하1층, 지상1층~지상5층 (미아동)', '강북으뜸병원', ST_GeomFromText('POINT(127.026184524499 37.6254205559935)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1117285', '$2b$04$verrMIES22G1yX7Q/HwHv.Wh7x75c4VLXciFwYCUfCptiiDTTTKVm', '5d437e5b-a8bc-482e-bba6-4dd2fbb3d872', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5373576230977, 126.836699017573, '서울특별시 강서구 가로공원로 187, 강서케이병원 (화곡동)', '강서케이병원', ST_GeomFromText('POINT(126.836699017573 37.5373576230977)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200009', '$2b$04$XN8Aq2vkH2wigjCNkONLP.FX1Nwnd4opy5H6c9eRVX0cAQeLc0ZdK', '56a7bbab-30c7-44a3-8e2c-63dd22e6a5ca', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.87497158192399, 127.74448573764938, '강원특별자치도 춘천시 백령로 156 (효자동)', '강원대학교병원', ST_GeomFromText('POINT(127.74448573764938 37.87497158192399)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200011', '$2b$04$.UY/mW4ncB4.p8BgFvVjIuSvGTaTOcMTL9AvallytChsbA4O0Z406', 'a61545e4-ce00-4fdd-8ad7-12b4de22a293', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.74931042017154, 128.8887963251862, '강원특별자치도 강릉시 경강로 2007-0 (남문동,강릉의료원)', '강원특별자치도강릉의료원', ST_GeomFromText('POINT(128.8887963251862 37.74931042017154)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200007', '$2b$04$gIDW.fhIvnM5q2OZK3Bf2OxE3Ee/P96wUlg2K0FXkK0zKsWP4yu3.', '7f1329cf-df2b-410e-8fc6-824a524948bb', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.44027922704624, 129.16370014395005, '강원특별자치도 삼척시 오십천로 418 (남양동)', '강원특별자치도삼척의료원', ST_GeomFromText('POINT(129.16370014395005 37.44027922704624)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200012', '$2b$04$Cf3y1rY2/s9kas2plcdyzuM0VKYEVR8vUSYxVNDuCBAI10Upx/5Hm', '37acd2f7-8cbf-4c73-b464-84769d83c7c1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 38.21622784728713, 128.5891194514502, '강원특별자치도 속초시 영랑호반길 3 (영랑동)', '강원특별자치도속초의료원', ST_GeomFromText('POINT(128.5891194514502 38.21622784728713)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200002', '$2b$04$vgLt0FZH2ulF9I56RH7NhOTSF2E4kvgfeccjD6IOk6PrLrse5s0ja', '8a658027-44d0-4c2f-b748-3697f86e7458', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.186588403987926, 128.46530529870284, '강원특별자치도 영월군 영월읍 중앙1로 59-  ( )', '강원특별자치도영월의료원', ST_GeomFromText('POINT(128.46530529870284 37.186588403987926)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200015', '$2b$04$MzTIeVCRxKOXrYAA43L2Eu3Zgo.wPIYz4FSGvGqAqlYbOMy3tTTqu', '04b29c58-8b94-40a0-8f74-f370f2c6c34b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.332496031537154, 127.94896203327231, '강원특별자치도 원주시 서원대로 387-  (개운동, (개운동))', '강원특별자치도원주의료원', ST_GeomFromText('POINT(127.94896203327231 37.332496031537154)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2803677', '$2b$04$CleQgGedVgCCj3rXdMcBKehLUnUlFjrw81lHTP2twzDXbB3r/okVG', '50fb596f-acc1-4287-a420-94021a256171', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.2567043538, 128.869611099, '경상남도 김해시 가락로 359 (구산동)', '강일병원', ST_GeomFromText('POINT(128.869611099 35.2567043538)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800076', '$2b$04$jU7EXYBXbk41zp4DkRhev.oHiKoSIBAwWSD43tPhWb6zkEbjqqFmG', 'af667ad4-e7b4-4570-bad8-730a8371788f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.686801911628535, 127.90877080146284, '경상남도 거창군 거창읍 중앙로 91', '거창적십자병원', ST_GeomFromText('POINT(127.90877080146284 35.686801911628535)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100002', '$2b$04$6II74C7tQGS91mGp1Wu.y.Dr9Fv4G8uCDsmufCsnASSqsn7rzO0ZS', '8de07540-50f5-4f32-81b4-0393998a5e3a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.54084479467721, 127.0721229093036, '서울특별시 광진구 능동로 120-1 (화양동)', '건국대학교병원', ST_GeomFromText('POINT(127.0721229093036 37.54084479467721)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300010', '$2b$04$hNSskmqnB2KDUVZlqV4Vy.fHetQEG9Zx5crK0/TCfCgA8HjSn/u9G', '03824643-3534-49c9-95d7-c6538ee15066', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.97897509717851, 127.92863660615964, '충청북도 충주시 국원대로 82 (교현동)', '건국대학교충주병원', ST_GeomFromText('POINT(127.92863660615964 36.97897509717851)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400010', '$2b$04$Jb7PLZ6Kdv8dM9QpoIWR2Ocl1lgtkVAU4yGMMTaIHhd9prhFz04/a', '053b9af8-75dd-47e5-87a2-d5a1523d12be', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.59241914491385, 126.6710400927469, '인천광역시 서구 청마로19번길 5 (당하동)', '검단탑병원', ST_GeomFromText('POINT(126.6710400927469 37.59241914491385)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100032', '$2b$04$YXlgnClMp9FU0GSckjsvhuCGSh/KX1pv2cj8woc8oW6t0JZd3poLa', 'a06f2a59-24ee-47d4-bb5d-3a0d91c103fd', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.29188165276277, 126.99638776108885, '경기도 수원시 장안구 수성로245번길 69 (정자동)', '경기도의료원수원병원', ST_GeomFromText('POINT(126.99638776108885 37.29188165276277)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100045', '$2b$04$DjtOBwcMsWdAS8yAaK0zr.11QSRCri9CM8oRX.kthHX3FAVFG06CG', 'faacf838-75de-4d68-9969-944688861766', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.01736702955601, 127.26033944589187, '경기도 안성시 남파로 95, 경기도의료원 안성병원 (당왕동)', '경기도의료원안성병원', ST_GeomFromText('POINT(127.26033944589187 37.01736702955601)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100043', '$2b$04$OiUPCzN8Vf9wq1akvxG3Nusu4wormt2V9dkY2WuCJneS5ca/D06bm', '3b8a03b0-5630-4f5a-9a38-bb9f96a63a83', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.74108830096243, 127.04255485020957, '경기도 의정부시 흥선로 142 (의정부동)', '경기도의료원의정부병원', ST_GeomFromText('POINT(127.04255485020957 37.74108830096243)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100193', '$2b$04$phOPS9X2SkI9tNHbGzM5s.hBEupSaPzNAt3Stm4oWDJLvjLOeAKOu', '69b2fe25-cd77-44eb-b8e4-8efef238698d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.282694444444445, 127.43266388888888, '경기도 이천시 경충대로 2742 (관고동)', '경기도의료원이천병원', ST_GeomFromText('POINT(127.43266388888888 37.282694444444445)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100035', '$2b$04$ExlQ4s7zqbzmrDy43.E63efbbIe0H55b0K9qYAPD2N0P7PTYlVCRe', 'f80507fd-85ce-4ef7-b35f-523d250dd1c2', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.7548802103, 126.779637936, '경기도 파주시 중앙로 207, 경기도립의료원파주병원 (금촌동)', '경기도의료원파주병원', ST_GeomFromText('POINT(126.779637936 37.7548802103)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100031', '$2b$04$Kp.xHh.XePyg/AnxpOUlVOvcIJAJPIbeQT58QwVuBEU4W6DJ6mkIu', '8747ab37-af86-42c7-9404-f26c292e23c3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.903264018475866, 127.1983186069986, '경기도 포천시 포천로 1648 (신읍동)', '경기도의료원포천병원', ST_GeomFromText('POINT(127.1983186069986 37.903264018475866)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300002', '$2b$04$O6GLpulQ1KfHeS32G5w6HeuHr2.GcRkSHOh8YiZkX/EbWaAz/UDJa', 'f857bf69-5480-4684-8461-e980bdde5b42', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.866235497221616, 128.60431466100363, '대구광역시 중구 동덕로 130 (삼덕동2가, 경북대학교병원)', '경북대학교병원', ST_GeomFromText('POINT(128.60431466100363 35.866235497221616)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800001', '$2b$04$scw3G2ghzFH9Zp2lgGfVvuKxMzIeYNgZpd0WQOij6GHshBr.rDXO2', '767adb21-d1c9-4017-b74f-9fe4cd9b513d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.176340165507916, 128.09564813723503, '경상남도 진주시 강남로 79 (칠암동)', '경상국립대학교병원', ST_GeomFromText('POINT(128.09564813723503 35.176340165507916)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800025', '$2b$04$XG24HQJtII2V4Tc6t6GGCunqu71CjxBVIBgWHjncNTMyhtF72NWeu', '85eafadc-0627-44b4-8c1a-f8f6f4e0e05b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.19906819846745, 128.56551976148475, '경상남도 창원시 마산합포구 3·15대로 231 (중앙동3가)', '경상남도마산의료원', ST_GeomFromText('POINT(128.56551976148475 35.19906819846745)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700018', '$2b$04$1UgQThl6SNg61/ePNkSu1.YjY4FMC/FsfzgMBZarK13Z7Gd8raexu', '76779494-0568-4257-97b2-ac3b09280747', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.12249076001089, 128.12649330522635, '경상북도 김천시 모암길 24 (모암동)', '경상북도김천의료원', ST_GeomFromText('POINT(128.12649330522635 36.12249076001089)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700001', '$2b$04$DbLl9fee32meWd7h/p/2fuGCfvcAjNgoTpP0WMMEI.6KvxqsybQha', '83bdad08-8090-4184-921b-a4c0d554bc6e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.56826733448251, 128.73213342858523, '경상북도 안동시 태사2길 55 (북문동, 470)', '경상북도안동의료원', ST_GeomFromText('POINT(128.73213342858523 36.56826733448251)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700005', '$2b$04$axIa2WmX08vQQ5lqWKVvdOhIC9iQ7rJBAYl16VKnG2Wq9TO/rcUEm', '1aa9a9cc-c3f4-4092-b12e-878306fee7fd', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.03462413480262, 129.3549930430143, '경상북도 포항시 북구 용흥로 36 (용흥동, (용흥동))', '경상북도포항의료원', ST_GeomFromText('POINT(129.3549930430143 36.03462413480262)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100039', '$2b$04$cznrn7kS4bD7dr0KTAVqyeZDnmT7Rchsgt3K8F08UADcS7QyS2K0W', '73f754ef-1d74-40c8-87d2-4327ccac44f7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.496413213560785, 127.12348793503202, '서울특별시 송파구 송이로 123, 국립경찰병원 (가락동)', '경찰병원', ST_GeomFromText('POINT(127.12348793503202 37.496413213560785)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100001', '$2b$04$n3w42l69IhWdG3/a/uLL/egLjzy/4IW2BqcHozVD2f/WtQD37.RX2', 'e587d3fe-fde9-48f0-b69b-b212468bc357', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5938765502235, 127.05183223390303, '서울특별시 동대문구 경희대로 23 (회기동)', '경희대학교병원', ST_GeomFromText('POINT(127.05183223390303 37.5938765502235)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700097', '$2b$04$LxIZ3CkELOO5jyRW9H7hIO8s2vtZIWZmaCg/4LFULp8mchzXjnAyG', 'e85cc685-2cc6-4076-86ae-d137760631d9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.84545696334947, 129.20964031186756, '경상북도 경주시 봉황로 65 (서부동)', '계명대학교경주동산병원', ST_GeomFromText('POINT(129.20964031186756 35.84545696334947)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1303386', '$2b$04$HTfiG9q8dynaiEP5TZC9wuK5.XwVxQ8DcWlTgBe.tqQKa.Sm7CSCS', '8005942d-006b-45cb-9304-d70dd4ba51e8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.869459650891685, 128.5829311080459, '대구광역시 중구 달성로 56, 계명대학교대구동산병원 (동산동)', '계명대학교대구동산병원', ST_GeomFromText('POINT(128.5829311080459 35.869459650891685)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300003', '$2b$04$JLU71SVVxqs/l9jZeRhp6ueAH7qJrR5mOOoU9XdGKgcmYv8Lpqg9i', 'e0ca1b87-7050-4636-99b9-2dcd7c720efe', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.85388728949212, 128.48012966656532, '대구광역시 달서구 달구벌대로 1035 (신당동)', '계명대학교동산병원', ST_GeomFromText('POINT(128.48012966656532 35.85388728949212)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100014', '$2b$04$eC96rXC.sCvWH/93VN7OQ.f6FlcIcufvpC8n.I5iOqaJXEIhhi1YO', 'd3e2c617-6cf5-41b2-ad4c-5ff46ebd70ae', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.49211114525054, 126.8847449363546, '서울특별시 구로구 구로동로 148, 고려대부속구로병원 (구로동)', '고려대학교의과대학부속구로병원', ST_GeomFromText('POINT(126.8847449363546 37.49211114525054)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100003', '$2b$04$ZrS9vE.iOw54FGAfyceMn.gACcFhlzh1UxNgTgJ5Mcxx9yAZ1OzNi', '261a117c-4d4b-4350-9623-5da085226375', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.31885818300129, 126.8250018362211, '경기도 안산시 단원구 적금로 123 (고잔동)', '고려대학교의과대학부속안산병원', ST_GeomFromText('POINT(126.8250018362211 37.31885818300129)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200004', '$2b$04$TYREhTdPha0lJ/BLfQUrAeboapl8329kt3r.Ug7.ug/gLjp20dpqq', '1e069bae-908e-4587-9f40-e961feab42c4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.08029169184386, 129.01572016067405, '부산광역시 서구 감천로 262 (암남동)', '고신대학교복음병원', ST_GeomFromText('POINT(129.01572016067405 35.08029169184386)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600029', '$2b$04$RPQ.dEZETn3NhW509sb9yeZ2MiVNk7vAQSCVxSR9PyJ3iuIhLR8c.', 'c61f14ed-539a-45af-be92-8aa003b2e893', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.27628370526432, 127.2879760334259, '전라남도 곡성군 곡성읍 곡성로 761', '곡성사랑병원', ST_GeomFromText('POINT(127.2879760334259 35.27628370526432)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300008', '$2b$04$X6mEZsgQnNTnZkf4gfZ/TeFIPDq8Fc5Z3F5GWZ6ZLvVSXFNzOhk3y', '21941292-92b3-4dab-ab92-ca77c45f22a5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.870693147975665, 128.58872807724623, '대구광역시 중구 국채보상로 531 (수동)', '곽병원', ST_GeomFromText('POINT(128.58872807724623 35.870693147975665)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100007', '$2b$04$3e9VyHWekamCaQHlx27Oaem7GeTOCCJXSoXpjbgArUFKFQWwBe5AG', '4999ff3a-7b9d-4238-a4d0-f978b98ed136', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4734614743463, 126.87192258470483, '경기도 광명시 디지털로 36, 광명성애병원 (철산동)', '광명성애병원', ST_GeomFromText('POINT(126.87192258470483 37.4734614743463)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600006', '$2b$04$RGHhkUsMZRtrzgh/WyJ69uF7K1Sbu6VdO6c/fVeVqJPuonquoUlHq', '8e462d46-d74b-4d5c-a9cc-0ad8bde5ae77', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.93614549410383, 127.6969510970332, '전라남도 광양시 공영로 71 (중동, (중동))', '광양사랑병원', ST_GeomFromText('POINT(127.6969510970332 34.93614549410383)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500021', '$2b$04$HT4PDdXVpMkoF9mAK2Fyj.fKUHoalORwnSydk2dDvXmrRGdP2ATVK', '69f40beb-5103-4e45-9193-cda73c19f1fb', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.136682861070376, 126.91198438867642, '광주광역시 남구 양림로 37 (양림동)', '광주기독병원', ST_GeomFromText('POINT(126.91198438867642 35.136682861070376)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500015', '$2b$04$DY6G3DZeJFNXSymOmVlvyO7azzA8aXbPGuXZSnOKxumvU8iM5WB2W', '7ab23ff0-2f59-4cee-ba98-727d700dd3f0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.178949208210625, 126.9281507303555, '광주광역시 북구 면앙로139번길 51 (두암동)', '광주병원', ST_GeomFromText('POINT(126.9281507303555 35.178949208210625)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500004', '$2b$04$xTup/t6GGrFUWXWdYT0DfO4dS5VkweBIxdKdC/XLtTsHzxDWkSe9O', '630a70fe-5a28-4d0f-8631-5c35a12d64be', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.207797211036485, 126.84947860623933, '광주광역시 광산구 첨단월봉로 99 (산월동)', '광주보훈병원', ST_GeomFromText('POINT(126.84947860623933 35.207797211036485)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1502007', '$2b$04$SDimE.Ei8pSBy.GmmNEq0OVHe/FvEmDuu62uwmWjG6dn8S5StQByC', '15d8c16d-cf31-420a-a47b-53f995fab845', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.185893735732634, 126.82909951503984, '광주광역시 광산구 수완로 6, A동1,3,5,6층/B동동 (신가동)', '광주센트럴병원', ST_GeomFromText('POINT(126.82909951503984 35.185893735732634)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500018', '$2b$04$trxM44S0PjsP3Q2t3Zvib.U9urxyaEv8D7EZ4UbRNl3iMBjiZ91jW', '70573c35-6db8-4c1f-8a47-5a61c3f46928', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.19303617477934, 126.82420927535313, '광주광역시 광산구 임방울대로 370 (수완동)', '광주수완병원', ST_GeomFromText('POINT(126.82420927535313 35.19303617477934)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500009', '$2b$04$MIOLhyJMctX12vCb269QHut0DQcPJdJIXl7DeeKx8LTRP3I41umgS', '4c331da2-6a90-449e-bf2e-30e54cc2bb4f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.11776253778263, 126.8995475485602, '광주광역시 남구 서문대로654번길 5 (진월동)', '광주씨티병원', ST_GeomFromText('POINT(126.8995475485602 35.11776253778263)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500043', '$2b$04$TBf2kTnXKal1JTrhdWiqX.MKwOi7CCsAU/dUJdLEI9k3ZJ75w7/jK', 'c99f8c98-343d-4784-bc64-a59192a6c60a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.13768234340966, 126.79889471288638, '광주광역시 광산구 송도로 271 (송정동)', '광주열린병원', ST_GeomFromText('POINT(126.79889471288638 35.13768234340966)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500005', '$2b$04$Mt5x11eS1As604jTSCIAQ.REBt0EJ7Vkzbzx2ISoOSv/R6ggHCdua', '20753be6-bcb5-44e6-86a4-6a6a1b0caa16', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.20286119554041, 126.89760857687219, '광주광역시 북구 양일로 309 (일곡동)', '광주일곡병원', ST_GeomFromText('POINT(126.89760857687219 35.20286119554041)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500016', '$2b$04$0IfWdqxI88qN6NUm.80Xj.F8bbk9BY6dpumqWbaw2yAoFqiRwyZuC', '2cb25944-1137-4a66-a0bc-f5860d62b39a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.15618108764772, 126.86880878336211, '광주광역시 서구 월드컵4강로 223 (쌍촌동)', '광주한국병원', ST_GeomFromText('POINT(126.86880878336211 35.15618108764772)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500003', '$2b$04$uZ0MM6em0RkeMv0FssC6Je/0MoMXXRT26ZXBOwefRyzXfsbuA.SnC', '5d40b31a-b75c-4961-8a20-e6a475a1ec67', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.18565646419727, 126.89798149528589, '광주광역시 북구 설죽로 291 (용봉동)', '광주현대병원', ST_GeomFromText('POINT(126.89798149528589 35.18565646419727)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500007', '$2b$04$insz6y3ChYrlanbYUFj9geTcSvDCwRqLWdUB/P5xuSEvueb5w0teC', 'ca3da07d-5f82-4e6f-9255-052702620409', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.21344678097714, 126.87471568685204, '광주광역시 북구 하서로 429 (용두동)', '광주희망병원', ST_GeomFromText('POINT(126.87471568685204 35.21344678097714)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600061', '$2b$04$IefHqBEYUpPn/EwGDrXPHueYL9JOCK3ZKY3FbJ.QkhK1jnfHA/KqK', '8e397acd-4ac2-4de3-ac01-fb6e19757926', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.215900947788214, 127.46406009751603, '전라남도 구례군 구례읍 동편제길 4', '구례병원', ST_GeomFromText('POINT(127.46406009751603 35.215900947788214)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100026', '$2b$04$bs.t.coP.prz6abZuQisCO1jPFn9Hedn5ddH8uBUm4ymHgDCU6Hwi', '3307651f-0531-4d52-88a6-d30eae43eade', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.49964578669388, 126.86636039556485, '서울특별시 구로구 경인로 427, 구로성심병원 (고척동)', '구로성심병원', ST_GeomFromText('POINT(126.86636039556485 37.49964578669388)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700015', '$2b$04$9J4Asi3yXPpX3c0UcpgFI.D696PEuJW1x4l/fV39RbYpewl1ZJ5F6', 'f8d4974f-ceea-46b7-aad9-718431ba51ab', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.096198858616575, 128.42297791647263, '경상북도 구미시 인동20길 46 (진평동)', '구미강동병원', ST_GeomFromText('POINT(128.42297791647263 36.096198858616575)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200045', '$2b$04$fn4zBNH9Swtyj3dRQMjaa.NryJ8x2YPRg8aT3gUZLNb8At3fJ.mSK', '6bd5e126-9df0-486f-9e24-c14f9aa5ca20', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.20971002878793, 129.0047510374652, '부산광역시 북구 낙동대로 1786 (구포동)', '구포성심병원', ST_GeomFromText('POINT(129.0047510374652 35.20971002878793)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100258', '$2b$04$dVrNIHGG82FLKkBO8f/44uw8ggoDiUVHLIZdmp5gC5TgWe9OZbBI2', '7f751b0d-9158-4ab0-8eee-3fd2e9fef313', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.39186666666668, 127.14858611111111, '경기도 성남시 분당구 새마을로177번길 81 (율동)', '국군수도병원', ST_GeomFromText('POINT(127.14858611111111 37.39186666666668)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100049', '$2b$04$EsD8jjyGS00O6PzkIN4MWO6xy7jEagy7Chma3CfyvytUjDSl3g6Mq', 'ada881c7-e720-4934-8bd9-0c592d2d9ad8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.664170778165285, 126.78327945120733, '경기도 고양시 일산동구 일산로 323 (마두동)', '국립암센터', ST_GeomFromText('POINT(126.78327945120733 37.664170778165285)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100052', '$2b$04$0gEF4vJ6TFKfewefvsBr/.7UnWfYjTgvc4zPc462ezRwrI.UXS8qO', '77aa0bab-7cbf-4b7e-b53e-d9b1bdb243a8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.56733955813183, 127.00579539705473, '서울특별시 중구 을지로 245, 국립중앙의료원 (을지로6가)', '국립중앙의료원', ST_GeomFromText('POINT(127.00579539705473 37.56733955813183)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100033', '$2b$04$RiWaMjxlnptdODfx9ByOIOPTz5I6t9CKie4kgpopoLKH1zkpzSvRq', 'e1d4c303-909c-4d1b-a930-9d2ad7e8b12e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.64530592402248, 126.792204040477, '경기도 고양시 일산동구 일산로 100 (백석동,백석1동 1241외1필지 4층)', '국민건강보험공단일산병원', ST_GeomFromText('POINT(126.792204040477 37.64530592402248)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400045', '$2b$04$c7q6APVPtq7ZXxf55B3f6uIUdu7yoKyBujGAixsqQIa0Vj3Rcqgnm', '27259cd0-a0ca-4308-9d27-2da8fdd7086d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4655067884563, 126.693226276277, '인천광역시 남동구 석정로 518, 1층일부, 2층일부 ~ 9층 (간석동)', '국제바로병원', ST_GeomFromText('POINT(126.693226276277 37.4655067884563)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700010', '$2b$04$8kqvOiXGGJb80IQaQSV8COV/xtw3dd1fJ/AMT8Ud4Asqi1tgb2.0C', 'd366a6db-01c2-478b-941c-2b7e39d367bd', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.535010719916684, 129.31995893362847, '울산광역시 남구 삼산로 110 (달동)', '굿모닝병원', ST_GeomFromText('POINT(129.31995893362847 35.535010719916684)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800012', '$2b$04$QXmPqscoUz.yZTzCi7HgxOww9/yXbMiZNSD1EOpIoiBmPf8cgmMSm', 'eb1df089-ac5d-424d-9a89-b5ec368cb420', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.21861866618743, 128.6715437456084, '경상남도 창원시 성산구 창원대로 721 (중앙동)', '근로복지공단 창원병원', ST_GeomFromText('POINT(128.6715437456084 35.21861866618743)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600009', '$2b$04$biFJKJDjJnKLNiAUtUAo0OQ2ko0748GRzXA2ZXrNlsAqFa.IUuvNG', '250eb61f-47fc-4738-8168-9fee3ce6ce10', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.36857686754784, 127.42849985514822, '대전광역시 대덕구 계족로 637 (법동)', '근로복지공단대전병원', ST_GeomFromText('POINT(127.42849985514822 36.36857686754784)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200038', '$2b$04$7DnHNEvGtyJGdS8Q/YKnSeLT2b3Lx/GZDzd66MyVWpODf1BDLNE5e', '832860f5-594b-44c1-bee0-f445f2422f1e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.53232311891651, 129.1058560226859, '강원특별자치도 동해시 하평로 11-  (평릉동, (평릉동))', '근로복지공단동해병원', ST_GeomFromText('POINT(129.1058560226859 37.53232311891651)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600012', '$2b$04$V6o1qWYpdFrbFtrS.W4JE.NppHIgW13IDfmk/oLv6UrAOGrBeQP52', '109e6ce5-b1bd-4ea8-94d9-036cc67bbf0b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.960325022571, 127.524525911996, '전라남도 순천시 조례1길 24 (조례동)', '근로복지공단순천병원', ST_GeomFromText('POINT(127.524525911996 34.960325022571)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100014', '$2b$04$CK5PxVsQWMaMlaOtayzzzeYklFZZGe6OEvUNhNTIcL5g1F23tOoei', 'd3a8178d-192f-4349-b75b-8a0f0e38abdc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.31687107499767, 126.87402848671928, '경기도 안산시 상록구 구룡로 87, 근로복지공단안산병원 (일동)', '근로복지공단안산병원', ST_GeomFromText('POINT(126.87402848671928 37.31687107499767)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400032', '$2b$04$.3SU4YvKy15UFeIgGVGMqOemOrAtjt4TUlLMPdr5s/z3QlthXSxhS', 'b57ec36b-e9bd-4a89-9a5a-63e416301fb0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.476349746510174, 126.75331590774624, '인천광역시 부평구 무네미로 446 (구산동)', '근로복지공단인천병원', ST_GeomFromText('POINT(126.75331590774624 37.476349746510174)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200048', '$2b$04$HPRtWMlMOI.MFvJITnvsZ.XDJOEfPkwpVO9uAaLIFc1dUC5Y5E2BK', 'e3a9293b-669a-4c13-ba96-317c350dc37a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.3829238141538, 128.658420530712, '강원특별자치도 정선군 정선읍 봉양1길 145', '근로복지공단정선병원', ST_GeomFromText('POINT(128.658420530712 37.3829238141538)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200004', '$2b$04$rPIk/jEdjnwe/1uvhDguZu/TsQ7dcnMT8bqZcM781mS8jSmxwY73q', 'baeff70b-8aaf-4519-ad37-283ec61f5958', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.10404228529155, 129.0042870499601, '강원특별자치도 태백시 보드미길 8 (장성동)', '근로복지공단태백병원', ST_GeomFromText('POINT(129.0042870499601 37.10404228529155)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600667', '$2b$04$1WA2SdKfBryyv8PQCpghjeGIwDKfdOSSoRmXsKWvHDrd80KlsEnsm', 'd06f953e-b723-4dca-9bbf-fa8a7f8dea1a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.349483798831656, 127.0297611902535, '전라남도 완도군 금일읍 감목길 5, 금일마취통증의학과의원', '금일마취통증의학과의원', ST_GeomFromText('POINT(127.0297611902535 34.349483798831656)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1122033', '$2b$04$MNV9g1RoHz4W99Kalelcd.hFkmELI6gr25O6uS0tfQNh.uLErGiuC', '560faeda-31b8-4868-a073-743ad39140d9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.482713030212, 127.018063486739, '서울특별시 서초구 서초중앙로 4, 기쁨병원 (서초동)', '기쁨병원', ST_GeomFromText('POINT(127.018063486739 37.482713030212)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500038', '$2b$04$CRl4GcGjpJk4yZ6rZ7vNpe8KIrA.RYdNmH2h0FN42PZ/Iw44VRwAC', '21eff3fe-a267-463f-adca-7ed821608050', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.80673935689978, 126.87969956139742, '전북특별자치도 김제시 서암4길 45 (서암동)', '김제우석병원', ST_GeomFromText('POINT(126.87969956139742 35.80673935689978)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300038', '$2b$04$3TYkEJJ6zWGXi3rW47HtN.bScxO93aXpO6sulcWZIAzK5rGYDq4Yq', 'de9b4ea8-0d8b-4734-96e6-fd8640b2b8ae', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.8147002604042, 128.525094795643, '대구광역시 달서구 월배로 97, 나사렛병원 (진천동)', '나사렛종합병원', ST_GeomFromText('POINT(128.525094795643 35.8147002604042)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2402812', '$2b$04$Rzk/VHDLNNJsu5z4bBuHBuiFxh28zIkx3o9IMJUvY0y2nG57hFx1q', '134a90d3-baa3-4770-9701-48d4ec2dacf9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.8191502671463, 127.159326385319, '충청남도 천안시 동남구 만남로 64, 1층일부,4~9층 (신부동)', '나은필병원', ST_GeomFromText('POINT(127.159326385319 36.8191502671463)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600016', '$2b$04$Xx9Rsr6gS3vxCsk4rX8U2OAHhasJLi08axXuxte10vUQtjOqSSZ4W', 'c775ed35-800a-48db-95ed-205263449b8d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.03640277777778, 126.72143611111112, '전남 나주시 영산로 5419 영산로 5419  (성북동)', '나주종합병원', ST_GeomFromText('POINT(126.72143611111112 35.03640277777778)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100041', '$2b$04$m252JW8Iwm2d6YS0RZWw/Owp0UgGlz3Mmo7PdQV1kopS4sEt5Z7y6', '4ec3763e-2671-4e70-830c-f47c1577d5dd', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.682380941575715, 127.2043136287129, '경기도 남양주시 오남읍 양지로 47-55', '남양주한양병원', ST_GeomFromText('POINT(127.2043136287129 37.682380941575715)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100048', '$2b$04$JSpEiLYQPemO818Tg1fTFOYsUznTcTx4sYPWMs8RWQMcaBjmkdBXW', '5c50b90e-8f99-4f60-9c1b-1e97d9eb9fad', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.636442927386746, 127.07000281991385, '서울특별시 노원구 한글비석로 68, 을지병원 (하계동)', '노원을지대학교병원', ST_GeomFromText('POINT(127.07000281991385 37.636442927386746)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100044', '$2b$04$YVKg3YMUq09FHO9S1kt.YuXNwJLPETKdc0sO/m4JrRjBXONWaJDre', 'dcbb6a66-949b-4adc-92fc-97217ea96604', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.58362083896108, 127.08605546969358, '서울특별시 중랑구 사가정로49길 53 (면목동)', '녹색병원', ST_GeomFromText('POINT(127.08605546969358 37.58362083896108)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100051', '$2b$04$TAZHvos3QKmLnOsj3WoUK.z0mdGUKMC0WOzGl2HxBo/WtLb7K626q', 'a74e3572-5aa6-4b1c-a38a-c00bb716af1d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.492016398433044, 126.78381841037, '경기도 부천시 원미구 부천로 91, ,부흥로373번길18, 부흥로377(기존디에스병원A동) (심곡동)', '뉴대성병원', ST_GeomFromText('POINT(126.78381841037 37.492016398433044)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400002', '$2b$04$xO5d0Hh2z8NVK8Ve6SKhTuFBuiTRORH1qVh0QTkArcuI/uOE/3VQ.', 'b6c878a8-2e32-4b86-a1cb-dc5b16321532', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.84295215169462, 127.17327537305154, '충청남도 천안시 동남구 망향로 201 (안서동, 단국대학교의과대학부속병원)', '단국대학교의과대학부속병원', ST_GeomFromText('POINT(127.17327537305154 36.84295215169462)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2300011', '$2b$04$yBA3WHmmGbPh.6Z1M4qO/O9kXHAOi0fNmaj8mDzKgFnFbWHy07U3C', 'e4a1c68a-a778-4630-8a32-54e2d9f9225b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.984540593096746, 128.36667620351827, '충청북도 단양군 단양읍 삼봉로 53, 단양군보건의료원', '단양군보건의료원', ST_GeomFromText('POINT(128.36667620351827 36.984540593096746)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600054', '$2b$04$8BpMNySuUnCrYJIk5vVHKuKX.oAtUDub.KTk0HJoPm87a.8hgfJQm', '042187a7-9cbf-400f-b28d-76211c1d569c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.31524596036869, 126.98263077003998, '전라남도 담양군 담양읍 천변7길 19', '담양사랑병원', ST_GeomFromText('POINT(126.98263077003998 35.31524596036869)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400008', '$2b$04$8iKbjPNI7LGeVjtIuWQrd.R6dgBWylZ.rZlOF2B.KDQL6XeC1bspS', 'e384de9e-5551-4ad9-bff3-6a5e12370fe4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.90439755063778, 126.68435813411776, '충청남도 당진시 반촌로 5-15 (시곡동)', '당진종합병원', ST_GeomFromText('POINT(126.68435813411776 36.90439755063778)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300004', '$2b$04$6sPwo.yM4PF6YNlMYTIe3.Fv/9TAMBF3hiHPEcH7OrHSWa13QupTi', '5264a6a4-5381-4060-8abd-862e27b3ae5f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.843065593522674, 128.56742621424615, '대구광역시 남구 두류공원로17길 33 (대명동)', '대구가톨릭대학교병원', ST_GeomFromText('POINT(128.56742621424615 35.843065593522674)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300005', '$2b$04$/diAIcrlkQ96rTlEjNBcQux0lP5FrxuF8WLJ6thGSUsW7/IoZqxEy', '6b947a74-77dc-479a-bff7-4aef1b82e7e5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.934879518784534, 128.54925198548904, '대구광역시 북구 칠곡중앙대로 440 (읍내동)', '대구가톨릭대학교칠곡가톨릭병원', ST_GeomFromText('POINT(128.54925198548904 35.934879518784534)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300076', '$2b$04$kJB91Qq2pzLkohQIxh0NpeHjzKsp2lvk2j88RACd6fL4W5hp2T6na', '34d5fac3-3c87-47a2-babc-85d4cadfc222', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.85296709243215, 128.5740666762668, '대구광역시 남구 성당로 224 (대명동)', '대구굿모닝병원', ST_GeomFromText('POINT(128.5740666762668 35.85296709243215)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300007', '$2b$04$Aeshqh5Xhl.G1mhITIs98eYlU3B4Egx4YRdIryDNzhKqov9OZDYfK', '273dfa47-96fa-4221-91e3-bf854892b19e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.859623434747526, 128.5405609266984, '대구광역시 서구 평리로 157 (중리동)', '대구의료원', ST_GeomFromText('POINT(128.5405609266984 35.859623434747526)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300009', '$2b$04$UwcWHV97ohXx24o203pfAe9v.1tQbjRabhNLUM3RxFzZft0380NDa', 'f657a2f5-736e-4aa8-ab1b-40079ffbcc05', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.88393360650045, 128.62383509209542, '대구광역시 동구 아양로 99 (신암동)', '대구파티마병원', ST_GeomFromText('POINT(128.62383509209542 35.88393360650045)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200018', '$2b$04$rUw4MjhME/a06DvBebiw7.PZ1HT3UnXmt74nMWhGCd.Hm1/OjrMqu', '975325c9-00c1-448f-b82f-dc075e8242b3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.204273174435535, 129.08021549527504, '부산광역시 동래구 충렬대로 187 (명륜동)', '대동병원', ST_GeomFromText('POINT(129.08021549527504 35.204273174435535)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100037', '$2b$04$aYMXpRsH88BwGqhMaL.x9OIWvPgfMUF1SKCbMtpujJvzhpGlTlmCC', 'af8d53f6-148b-47e4-885c-13acddff94d8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.49068925436284, 126.90716948025135, '서울특별시 영등포구 시흥대로 657 (대림동, 대림성모병원)', '대림성모병원', ST_GeomFromText('POINT(126.90716948025135 37.49068925436284)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600003', '$2b$04$IANY3DT3z3wEwrmGjlEbOul2/rW3v70Nhero6JBdBAUy5.h7Y7nJ2', 'ccb484ae-d1ae-4dd9-b1b1-6c9d72542a0e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.99175918279295, 126.48926066040337, '전라남도 무안군 무안읍 몽탄로 65', '대송무안병원', ST_GeomFromText('POINT(126.48926066040337 34.99175918279295)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100017', '$2b$04$iVQy/aZhcntCS3.qU5/jXOf.Fsrn7dOBCqe76/OzNkpygok3./qga', '33302bfa-9d8b-47cd-966d-29f89661848e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.334033447174896, 126.80765584591039, '경기도 안산시 단원구 선부광장로 103 (선부동)', '대아한도병원', ST_GeomFromText('POINT(126.80765584591039 37.334033447174896)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500056', '$2b$04$N79eRjCdJ4TMLbBZyb4XMubsis9zaHUgC5zeO82EWl.Hiap/IstWu', '5d81ec8f-cde2-4133-a282-0497692f609a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.84599245880299, 127.153316348062, '전북특별자치도 전주시 덕진구 견훤로 390 (우아동3가,(우아동3가))', '대자인병원', ST_GeomFromText('POINT(127.153316348062 35.84599245880299)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600004', '$2b$04$J55rbocO5WxffmlQ5tnONe4J/3S0Sr/GLAxAUxNivd/J/JZRwRMRK', '9ec2f428-713b-47b6-8edb-a499fbf87b26', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.4469365928189, 127.43940812262, '대전광역시 대덕구 대청로82번길 147 (신탄진동)', '대전보훈병원', ST_GeomFromText('POINT(127.43940812262 36.4469365928189)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600003', '$2b$04$PCfHpx06o36DCTcIB.ueKexxYfsmbfTGHr6lUn29ZF11ajGKOZ0Za', '7dd8e25b-5ffa-436d-8ba9-ea3a99c00731', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.34831776122198, 127.43575049626224, '대전광역시 동구 동서대로 1672 (성남동)', '대전한국병원', ST_GeomFromText('POINT(127.43575049626224 36.34831776122198)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600014', '$2b$04$sRp3a1O8wZ2RZC3chtSXbuNudgo0zm7x0dfeDlA3iJ2fkMMjqayBO', '279e44a7-b8d8-45c8-91ad-e20cfabc56a9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.328994974921144, 127.43918933617724, '대전광역시 동구 동대전로 39 (신안동)', '대전화병원', ST_GeomFromText('POINT(127.43918933617724 36.328994974921144)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100025', '$2b$04$g.R5mB6DA6DYGkquwZMd/OLPUXAx5Qy1HdOzjOlSdSEzIQ2JneFIq', 'f03ff1ff-5afa-49ad-bbf5-7b0962d9a2d5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.387871379956906, 127.12132819639598, '경기도 성남시 분당구 서현로180번길 20 (서현동)', '대진분당제생병원', ST_GeomFromText('POINT(127.12132819639598 37.387871379956906)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1602246', '$2b$04$p0BgbsnEBPwBeC/t0s3d6e0j6WBarrALDL8TCFYRpiUh7Qkn22FPi', 'f50b2a49-bc70-4985-a2fb-2601fc1b3dce', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.308286328996566, 127.37055327992432, '대전광역시 서구 계백로 1322 (정림동, 대청병원)', '대청병원', ST_GeomFromText('POINT(127.37055327992432 36.308286328996566)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2803447', '$2b$04$Y6Tn5BJf/FahjMELrdcuC.WHw362wOcRA6YMZmBx6an3KIjBinthu', '4b3a02ed-3bf3-42d5-9d49-f09315a6bf63', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.97372179164495, 128.3262148441529, '경상남도 고성군 고성읍 동외로 142', '더 조은병원', ST_GeomFromText('POINT(128.3262148441529 34.97372179164495)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1123234', '$2b$04$WOInI4jxP6II3XZgRfMmkueLbhxy7dvML/dEveMs2OxehCJ2pGSyu', '87155152-b999-4934-9078-934b69f0dfaf', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5009902618151, 127.050967336445, '서울특별시 강남구 선릉로 404, 더드림병원 (대치동)', '더드림병원', ST_GeomFromText('POINT(127.050967336445 37.5009902618151)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300110', '$2b$04$Gla93r9HhGR4Kbs.wux2U.MhtgHffVd7qcwPcKAqJQMGPnYwsIkEG', 'f48897dd-2ae0-45b5-afa0-670ab1c5a4c8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.85264247289801, 128.54496871658273, '대구광역시 달서구 달구벌대로 1632, 더블유병원 (감삼동)', '더블유병원', ST_GeomFromText('POINT(128.54496871658273 35.85264247289801)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1303923', '$2b$04$txj/fjyfmmBR.96PVMdGh.Yy9Iq4mwC1Tae5fmatbErZN2F.oUTCK', '7b659cc2-49e8-438c-8714-bd9899a6468c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.8753003752946, 128.555296900418, '대구광역시 서구 서대구로 194 (평리동)', '더필병원', ST_GeomFromText('POINT(128.555296900418 35.8753003752946)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700003', '$2b$04$N2/0K9aVHBaEgut9C/uYIu7h6VTMm4K7utGinYO4/vHalN2HwqINS', '8b2f7b6e-e90e-419f-a51b-58a066bf293b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.85839884416154, 129.19669937927446, '경상북도 경주시 동대로 87 (석장동)', '동국대학교의과대학경주병원', ST_GeomFromText('POINT(129.19669937927446 35.85839884416154)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100047', '$2b$04$lf987.KWTixMVranVVlvnuHIWTBiM421wR1eS31sAsFSR1.Cr1.Ni', '54bd4d0c-e488-4a81-82aa-f7b508061491', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.67643677699999, 126.8055658392, '경기도 고양시 일산동구 동국로 27 (식사동, 동국대학교일산병원)', '동국대학교일산불교병원', ST_GeomFromText('POINT(126.8055658392 37.67643677699999)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200015', '$2b$04$0.gjaG3EPHfbHH7KtitbVe/1wBAj/2NPP0pX9Pk/Pvu36/niN5QzW', '7d79c633-590d-443b-8991-e4d8d0e1ff2b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.321418988977406, 129.24364922146094, '부산광역시 기장군 장안읍 좌동길 40', '동남권원자력의학원원자력병원', ST_GeomFromText('POINT(129.24364922146094 35.321418988977406)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100135', '$2b$04$dcgNBaYaSVIVVA6RmXh6zO7R3Pm6kbJKTXRaG8DIoVSmNdvL7zFeq', '122b54c9-a4b3-4aca-a6e0-d5aa4a062323', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.90888404022765, 127.05398051509535, '경기도 동두천시 동광로 53 (생연동)', '동두천중앙성모병원', ST_GeomFromText('POINT(127.05398051509535 37.90888404022765)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200011', '$2b$04$RTUvEod87Spik9/eX2din.RSDyWmwKf5cfqhs6Ig5WG5j9rcPdZZS', '901b9605-2531-4fce-8ba4-54425c7cd375', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.19694647632553, 129.0961666077834, '부산광역시 동래구 안연로109번길 27 (안락동)', '동래봉생병원', ST_GeomFromText('POINT(129.0961666077834 35.19694647632553)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200003', '$2b$04$FiufELhzPAFDmfHNtK1nGuWUA0S/bWOh0mFrdZazq2Qk4K6Io/Vjy', '5fc1e16d-8c60-4da9-ae03-9a504c94dbc5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.12000583968841, 129.01760368790895, '부산광역시 서구 대신공원로 26 (동대신동3가)', '동아대학교병원', ST_GeomFromText('POINT(129.01760368790895 35.12000583968841)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500013', '$2b$04$sSXK9r/zgmI1GblxBWbeneaLbfULioFRPLtQCJpuTk26f4nKN/FOm', 'a39c56ee-a9a3-4c9e-b617-0028f307bee5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.1347601218069, 126.89990593135208, '광주광역시 남구 대남대로 238 (백운동)', '동아병원', ST_GeomFromText('POINT(126.89990593135208 35.1347601218069)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100162', '$2b$04$90E09KZ6Imv2fEK4tfs2lORwEfJT86RBloFMXjl2aJG/yXMVdd/Ba', 'aae5a371-2f24-4199-88c3-539b566cf064', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.3356927564414, 126.852680642321, '경기도 안산시 상록구 월피로 88 (월피동)', '동안산병원', ST_GeomFromText('POINT(126.852680642321 37.3356927564414)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300034', '$2b$04$v/B6Hv/lYlItX4s63wuroOFCNZycNnfBNGAv/1jJx4Yd8A0xeiN.O', '497fc8fb-ba9a-4b19-a35b-ba18637a7587', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.8396345121582, 128.5743546304414, '대구광역시 남구 대명로 153 (대명동)', '드림종합병원', ST_GeomFromText('POINT(128.5743546304414 35.8396345121582)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2119276', '$2b$04$CW59tdKwkK1Pw04I8E8r0OvRak0mk4bQcplJZaoVBia6RJaHvHxny', '1e966907-cfde-4447-85c6-6a17e7e16f42', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.2389316890871, 127.05354381098, '경기도 수원시 영통구 태장로 68, 매듭병원 (망포동)', '매듭병원', ST_GeomFromText('POINT(127.05354381098 37.2389316890871)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800063', '$2b$04$sIaY4T.6JYMXgl8CRwxfce2Zck/l6QAafkzG/ADp0.cBdWqXEG0BO', 'b81b2cf6-9d66-4b51-b425-4628dff8ec7d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.19136230343627, 128.80394805433366, '경상남도 김해시 계동로 237 (대청동)', '메가병원', ST_GeomFromText('POINT(128.80394805433366 35.19136230343627)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100131', '$2b$04$Np3jTyiZB3VxQ0UrTpeW/eACqrwownwD3g39gVb1qT3ZWD2SQ2slK', 'de04c94e-c994-4db2-b735-f5a3b39b262f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.75804616829998, 126.7748532614, '경기도 파주시 금릉역로 190(금촌동)', '메디인병원', ST_GeomFromText('POINT(126.7748532614 37.75804616829998)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100024', '$2b$04$yflS3FIBqVBuLpKnhjgwv.Ig/c8PimtUtUdGhuaTOhPimUea86Il6', '59353f2f-37b6-40c1-8125-72f98f724329', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4938507104387, 126.89925446922592, '서울특별시 영등포구 도림로 156, 명지성모병원 (대림동)', '명지성모병원', ST_GeomFromText('POINT(126.89925446922592 37.4938507104387)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600020', '$2b$04$ju1s50JNM32BmjlGPZS0h.d1gQriNSlKg5rmHMVwswd8rPrTPMWpe', 'bfb9355b-856e-4316-8316-9d0cf31d58cd', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.80450726279005, 126.4204245807054, '전라남도 목포시 백년대로 303 (상동)', '목포기독병원', ST_GeomFromText('POINT(126.4204245807054 34.80450726279005)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600022', '$2b$04$.f.Tb5sRaiQW5SFsasEiBuk0pA.VpYQW9S9zKQRCFeJiowUnTUFh.', '694aa1e6-6596-4407-a114-5f5351bd6b0b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.80395500792446, 126.40538707879497, '전라남도 목포시 이로로 18 (용해동, (용해동))', '목포시의료원', ST_GeomFromText('POINT(126.40538707879497 34.80395500792446)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600011', '$2b$04$a50g05THL8QXjL.aj81b7eaSl78PWIc3f9.kXkm0E2Yr6R4d/L2C6', '5b255e74-a01a-4672-a8dc-c29561e60045', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.8092145829474, 126.4163391650001, '전라남도 목포시 영산로 483 (상동)', '목포한국병원', ST_GeomFromText('POINT(126.4163391650001 34.8092145829474)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2500019', '$2b$04$0jYNA7oh.TUvfwoWdTRA8u8th.tvhfczAR5FbWr25HDMsMZeG9BM.', '27fb8510-df8c-4455-a219-b813f1614f1c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.00586316008286, 127.67170265153939, '전북특별자치도 무주군 무주읍 한풍루로 413, 무주군보건의료원', '무주군보건의료원', ST_GeomFromText('POINT(127.67170265153939 36.00586316008286)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100083', '$2b$04$Nj0HziMdT4yzoN7o/weBwOqrmDuKl9gLUXMLqXm9mUBvoB7AChB/e', 'de404b7c-e792-465f-b249-69230841bbed', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.86396621605936, 126.78097787974224, '경기도 파주시 문산읍 방촌로 1675-20', '무척조은병원', ST_GeomFromText('POINT(126.78097787974224 37.86396621605936)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100130', '$2b$04$rQB9YGeUrFuqzpIN18vP3O/1PeVnXNmEljtVFn/lWKr71k54.0itS', '936e9ff8-1e3b-4eb6-9e8f-4e0d76f67b9e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.85424810677575, 126.78322857702757, '경기도 파주시 문산읍 문향로39번길 53, 문산중앙병원', '문산중앙병원', ST_GeomFromText('POINT(126.78322857702757 37.85424810677575)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500014', '$2b$04$ilj8ah70Az86biDxlHaqq.DqNEeL9VsgfoVIX4rVzGk.wPArDeRjy', '85885858-c7a2-448d-828d-b926ab670b4e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.14102639112141, 126.88528864095338, '광주광역시 서구 화운로 1 (화정동)', '미래로21병원', ST_GeomFromText('POINT(126.88528864095338 35.14102639112141)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100046', '$2b$04$iM6w3GhmkuAl9NDI66Fjr.RxspbQl28Ax/wWA1PWzQuw6Xo69WEeC', '6d19e791-149c-485d-8704-06db1efd7bab', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.55225379358291, 126.83602535156236, '서울특별시 강서구 강서로 295 (내발산동)', '미즈메디병원', ST_GeomFromText('POINT(126.83602535156236 37.55225379358291)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2106200', '$2b$04$1AVn7a3Nty6QYpt1R5iroeridQxJBKg4BzYoCTTZaD72xpsh6HsGS', '29f792d7-8de2-4b08-97e0-daf39f322577', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.445269636513494, 127.16256645920153, '경기도 성남시 중원구 광명로 330 (금광동)', '바른마디병원', ST_GeomFromText('POINT(127.16256645920153 37.445269636513494)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100180', '$2b$04$JWSeS9iRT2BLaSEkOY673.ibg7Jwd0S69w9Ss2kFfwEtDNabZl8oe', '9f2b0672-2bbf-4c23-add8-a707a37100bb', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.27373314023728, 127.45038927398872, '경기도 이천시 경충대로 2543, 바른병원 (진리동)', '바른병원', ST_GeomFromText('POINT(127.45038927398872 37.27373314023728)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800084', '$2b$04$nFJtDdb7TPTkTGXR1Bps/OmYspYVBe.CUOFh2//uAerI4FkQVUdjC', 'bc08fd54-e878-44f8-87c5-d63699a32243', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.19175352096591, 128.08828232510143, '경상남도 진주시 남강로 701 (장대동)', '반도병원', ST_GeomFromText('POINT(128.08828232510143 35.19175352096591)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800019', '$2b$04$ZnTuG6Y3OF50hF7wS6DbheFeJKaDx9rD5zGibrVFAjiOcgbgEQ4/i', '8d9966fd-0713-4f18-9940-f550acf0a353', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.3532221786617, 129.04356811738057, '경상남도 양산시 신기로 28 (신기동)', '베데스다복음병원', ST_GeomFromText('POINT(129.04356811738057 35.3532221786617)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600052', '$2b$04$eVb5oca.haMj9zMqXJxppeHp9jIu8HmqvOgskExxlUueNctvISHQe', '7767e99f-ef1a-43ce-8035-03e53f321483', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.775470518786, 127.104284083365, '전라남도 보성군 미력면 가평길 36-17', '보성아산병원', ST_GeomFromText('POINT(127.104284083365 34.775470518786)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2803867', '$2b$04$C0FQEC0w/0kpAEenXyV.sufz9so5maO36MgZhkdnu3lWjWHR6mrHS', '81e683d1-f4a5-4f56-8022-bc4ca9aaf365', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.3269948206, 129.0152648627, '경상남도 양산시 물금읍 청운로 343, 양산바른빌딩 1층일부, 4층~10층', '본바른병원', ST_GeomFromText('POINT(129.0152648627 35.3269948206)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700071', '$2b$04$CO1QBfSCDJpPd3l4I7XGS.sTZBc.iBrzOgNgobUS0KT1LrvRhEr1y', 'e150129a-3a5b-45e8-9084-d84b9c35c9c0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.89170700324608, 128.73350079244224, '경상북도 봉화군 봉화읍 보밑길 3', '봉화해성병원', ST_GeomFromText('POINT(128.73350079244224 36.89170700324608)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100036', '$2b$04$/NmMsNUovbFZPmIgq7YwxOaCDX8./mAQ0xgVPAUzn8BL4JaWR7Cn6', 'd479ec47-c11a-43ea-a073-59d415f679f9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.556940892893586, 126.85094950539181, '서울특별시 강서구 공항대로 389, 부민병원 (등촌동)', '부민병원', ST_GeomFromText('POINT(126.85094950539181 37.556940892893586)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200024', '$2b$04$HnKAgGe7OCUR/RSt4bQpguzxsyP6wcOJjgz8ukB2jqwHVTtSCOAOm', 'c08677da-0d64-436c-a05e-c9159f2d01b2', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.187312651309654, 129.05917919433944, '부산광역시 연제구 월드컵대로 359 (거제동, 1동, 5동일부)', '부산광역시의료원', ST_GeomFromText('POINT(129.05917919433944 35.187312651309654)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200002', '$2b$04$FAjODlaTg8owcE9MdCtB.eHYI4MNsMP9tHIPEvfGDLHDh18ZCCqse', '94389d8b-3ac2-4b80-97c3-e54116ae6a2d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.10105418267188, 129.01922207984205, '부산광역시 서구 구덕로 179 (아미동1가)', '부산대학교병원', ST_GeomFromText('POINT(129.01922207984205 35.10105418267188)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200013', '$2b$04$JgRujTXqmuW5Qjla9dj/7eWn9FkAZW61R96bFhziOXW0i/p3jNSdG', '8c807705-9eed-41d6-976a-0a9aa67b7223', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.110457328247016, 129.10919202844133, '부산광역시 남구 용호로232번길 25-14 (용호동)', '부산성모병원(재단법인 천주교부산교구유지재단)', ST_GeomFromText('POINT(129.10919202844133 35.110457328247016)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500010', '$2b$04$lIU9i.DNulWl65HJeDz7Uu.v7oVWrdbknBAyUorCLTFHuR3G43RD2', '4e912c46-da8f-465d-ab2f-52c904a0cb83', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.724815399252556, 126.73452574138332, '전북특별자치도 부안군 부안읍 오정2길 24', '부안성모병원', ST_GeomFromText('POINT(126.73452574138332 35.724815399252556)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100055', '$2b$04$0Opzg53WjmWYf0NyzZl4cOluWY0G2pDqJclX6myivxghiDkvs0Hje', '957664e4-3601-4f61-a104-d140e1c1f5be', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4810049006, 126.79116743230001, '경기도 부천시 소사구 호현로489번길 28 (소사본동, 세종병원)', '부천세종병원', ST_GeomFromText('POINT(126.79116743230001 37.4810049006)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100058', '$2b$04$8v8.l0.V4n1G9f8Z7rgdS.L4ocFmF/M1uoafj5olOFkw9s13mcaOq', 'bd8561d6-3cb6-4a86-8966-d07756015190', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.52438752921628, 126.8051855988659, '경기도 부천시 오정구 소사로 726 (원종동)', '부천우리병원', ST_GeomFromText('POINT(126.8051855988659 37.52438752921628)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100001', '$2b$04$/E5EFZGEHbzjkryUaqNxF.lv5KtT959LSDoIlQLWHn3vEb/GJklyu', 'dd300641-222c-4324-9001-7dfa13adff80', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.35202597297615, 127.12448354572743, '경기도 성남시 분당구 구미로173번길 82 (구미동, 분당서울대학교병원)', '분당서울대학교병원', ST_GeomFromText('POINT(127.12448354572743 37.35202597297615)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1403617', '$2b$04$JcKYd7tLCF08YUNFjl/TOeLwr8RsKwd24D9oc6RkQt9vuMrOZ3Hhe', 'fb060b5f-d4bf-44b1-9582-98511e1b9b93', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.7360530472, 126.4857069547, '인천광역시 강화군 강화읍 충렬사로 31', '비에스종합병원', ST_GeomFromText('POINT(126.4857069547 37.7360530472)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200007', '$2b$04$zQpoSs6KX.oqT8rZxoVUzu7ijy2mdE6WCa6SoaB3eyvOtAvvQrZpW', '05c6d17b-dd66-4264-8681-d7e67d1c65af', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.1610460623, 129.1128811328, '부산광역시 수영구 수영로 615 (광안동)', '비에이치에스한서병원', ST_GeomFromText('POINT(129.1128811328 35.1610460623)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1206845', '$2b$04$OfSpDci1WM0p/qHtVwEXQuc.2rTrwh/4Q9TliHBVSPUlML72aaBmm', 'f8227fff-df9a-461a-b3a9-70e9bda77d21', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.195932829913, 129.108211921917, '부산광역시 동래구 충렬대로 455 (안락동)', '빌리브세웅병원', ST_GeomFromText('POINT(129.108211921917 35.195932829913)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2602211', '$2b$04$q1RPrMrv6sU4fKBh/BnWXOhzFSc8WHOgAMDjH2ql4ZQwDHRsE1uIq', 'ea9ee997-9920-408a-b4a2-a4be08cd5313', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.024204844204, 126.798747430459, '전라남도 나주시 정보화길 49-0 (빛가람동)', '빛가람종합병원', ST_GeomFromText('POINT(126.798747430459 35.024204844204)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500078', '$2b$04$Ipf.POE9bsGL71XJVRSx.uhAdV0IK5DvB.4pShr8WQ4R8w9slSc3.', 'd298c897-fc1d-4a8f-a39c-4c6c2b7e743e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.094479626794445, 126.89638434544385, '광주광역시 남구 덕남길 80 (덕남동)', '빛고을전남대학교병원', ST_GeomFromText('POINT(126.89638434544385 35.094479626794445)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100148', '$2b$04$dYwUn0Ju/Cf9b44zjPV18etG4.75lZJkaAjEAs2A0e0NkMMNkqDFi', '24d839f4-cb69-494b-9e82-86e0903f008e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4796247835746, 126.956285774259, '서울특별시 관악구 남부순환로 1860, -1,1,3,4,5층 (봉천동,  )', '사랑의병원', ST_GeomFromText('POINT(126.956285774259 37.4796247835746)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2800380', '$2b$04$9oxdnZPl499gJetzQu5sEuGxVlcGij/SiV/gWb62E7sZ5Cj4.HHyS', 'b11e53d9-8ddf-4c7d-8b7a-8a4174b9a9b3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.4160463200281, 127.88419591621033, '경상남도 산청군 산청읍 중앙로 97', '산청군보건의료원', ST_GeomFromText('POINT(127.88419591621033 35.4160463200281)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100010', '$2b$04$uQ5aBK6ATvMrw8X/C.5ksuMoBJ2UpIuU4XcVEMUdSn/YuETgVX9tG', '6660f2e1-a788-4e7b-9a8b-196d258f220d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.48851613490445, 127.08668245340024, '서울특별시 강남구 일원로 81 (일원동, 삼성의료원)', '삼성서울병원', ST_GeomFromText('POINT(127.08668245340024 37.48851613490445)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800055', '$2b$04$jQoYGRHYbCBKw/y8Z28r6eTY19xQOEPmBa3U/x.qVC8WQaypUI2Rq', 'f1e4f161-4c98-4252-985b-78c351250341', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.56635668398722, 128.16327169035327, '경상남도 합천군 합천읍 대야로 876', '삼성합천병원', ST_GeomFromText('POINT(128.16327169035327 35.56635668398722)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200021', '$2b$04$rjs2VOkB4sXEfFa29td8ZukMKUlwhmqftS/u0bB9QQ5orJn.rPdSW', '968fb268-1625-414b-8992-6aed60256e8e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.11177720675051, 129.01074979097717, '부산광역시 서구 대티로 170 (서대신동2가)', '삼육부산병원', ST_GeomFromText('POINT(129.01074979097717 35.11177720675051)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100021', '$2b$04$YeGBqokDDN9OPnC4VyaOw.etHSwWvhs5CBckYWK8Oka22cvGraVh2', '1520f32b-c8ce-4e4e-8fda-4f71b928b5c6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.587992001305395, 127.0653288266823, '서울특별시 동대문구 망우로 82 (휘경동)', '삼육서울병원', ST_GeomFromText('POINT(127.0653288266823 37.587992001305395)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300045', '$2b$04$ak1BM68eBng3r3f/G2joMelbciJH/DcObG22vh6cU0dymV9iBU78K', '4a3a5f0c-b195-476d-8b52-1cc7b020572c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.8327479530047, 128.5538551132049, '대구광역시 달서구 월배로 436, 지하1,지상1~11층 (송현동)', '삼일병원', ST_GeomFromText('POINT(128.5538551132049 35.8327479530047)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800101', '$2b$04$plDkT7Tu2oYSWNgR.MpHZuaUn3qNWxvCs49r4fQI38/uVRn8qDmEK', 'dc7829d1-8894-4a66-8eee-cb695eaf23e3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.9375392862, 128.0795128117, '경상남도 사천시 중앙로 136, 삼천포제일병원 (벌리동)', '삼천포제일병원', ST_GeomFromText('POINT(128.0795128117 34.9375392862)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500022', '$2b$04$abJGEwXs1Ll/gCCKzXhMHOikPrECxyh2rYg9naTv73LzUtPYPenZq', '0cae0446-d82e-4488-83dc-ff1711ef0e63', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.15242290709782, 126.85391840686486, '광주광역시 서구 상무자유로 181-7 (치평동)', '상무병원', ST_GeomFromText('POINT(126.85391840686486 35.15242290709782)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700011', '$2b$04$n7NSwCj3dARqFtpn.sW91u5AFu8l0m//kGi2sIahGq/sWjmADBCve', '39fa3e70-dbe2-46de-b5b6-ab2834e356f1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.414640776098004, 128.15560122041242, '경상북도 상주시 상서문로 53 (남성동)', '상주적십자병원', ST_GeomFromText('POINT(128.15560122041242 36.414640776098004)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400019', '$2b$04$vVD7Ref9wy0uarPASYc1TuVTzD6vN3.Zg7/ejqzBJt57k6glFcZRq', 'd3654093-a268-4104-9041-055e8f558a74', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.10403152848004, 127.49620122672218, '충청남도 금산군 금산읍 비단로 183', '새금산병원', ST_GeomFromText('POINT(127.49620122672218 36.10403152848004)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800092', '$2b$04$9u3n7VUYhbMCf.RSH/ZIsuBo88eXkO2oiEHfd1Wk8a.egr57.iBlq', '846b1858-05e9-4e19-b0ca-cd1f67b399f8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.86535758722789, 128.4206525557243, '경상남도 통영시 무전7길 192 (무전동)', '새통영병원', ST_GeomFromText('POINT(128.4206525557243 34.86535758722789)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500020', '$2b$04$JTByj8ZxTN3p1opnqXre/.OxPqOKgk5m1OMwbIvT7dEsetSi065CG', '7299ae9a-7731-4f11-9908-3c5cd571f55e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.132568331498724, 126.85552710578938, '광주광역시 서구 금화로59번길 6 (금호동)', '서광병원', ST_GeomFromText('POINT(126.85552710578938 35.132568331498724)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400003', '$2b$04$ceGucRSTbv6JHMbyira7AepI5exl.ni9IpxW/pBKep4NUWKEbx2d6', '25caa158-cf86-4e53-80c7-5a2448d4d3e4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.78101237096687, 126.50342177166652, '충청남도 서산시 수석산업로 5 (수석동)', '서산중앙병원', ST_GeomFromText('POINT(126.50342177166652 36.78101237096687)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100017', '$2b$04$eBhek1dowxe.O/dXtKWFAeRO1LOn6pRgJgnRVwWr20WSoAPJa8Iki', '508f3244-59c7-4971-abb3-b5611f6e8582', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.57966608924356, 126.99896308412191, '서울특별시 종로구 대학로 101 (연건동)', '서울대학교병원', ST_GeomFromText('POINT(126.99896308412191 37.57966608924356)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1107402', '$2b$04$JmUF7QQZRpIj7CGJESlZweupFC8KFzdGyETCPIfAK18Ka3lVqiYGa', 'ccfa4d35-073e-4706-af7b-a13c5f48ca71', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5804523853297, 126.997196437908, '서울특별시 종로구 대학로 101 (연건동)', '서울대학교치과병원', ST_GeomFromText('POINT(126.997196437908 37.5804523853297)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700001', '$2b$04$VddfSMY4MEsX/YSxE64K1eiR0zOUUn.AqoAiSL2G9pDI99JaFrTU.', '53ce7efe-6214-416e-aeb6-10750a672ed7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.55991148325753, 129.12071299840133, '울산광역시 울주군 삼남읍 중평로 53, 서울산보람병원', '서울산보람병원', ST_GeomFromText('POINT(129.12071299840133 35.55991148325753)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100050', '$2b$04$llRXriBW4T3lFYK0b/TvIuioJWZ4r5M220gSDXA1TFfjK7uDz3FRy', '6f4b011f-d235-4c9a-b494-330cdffc3a57', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.58419129209865, 127.04983805981972, '서울특별시 동대문구 왕산로 259, 서울성심병원 (청량리동)', '서울성심병원', ST_GeomFromText('POINT(127.04983805981972 37.58419129209865)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100029', '$2b$04$RerMihNXgyrdTPiHg7JGi.Q5Tr6FyGZYWyOqXuz.IxZJKC07ky7Am', '0cee935b-f23e-458b-a03d-4e6ab55aa271', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.56715536263689, 126.96699861289684, '서울특별시 종로구 새문안로 9, 적십자병원 (평동)', '서울적십자병원', ST_GeomFromText('POINT(126.96699861289684 37.56715536263689)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100022', '$2b$04$kvsrq1gxnmLAHudC7hDL4OU2MRn0YTHPxkacZqocKReW5GKBPMIWS', '2b3fed1e-a8f2-4b63-9243-ed0d45d28810', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.57539886464885, 127.03140257525507, '서울특별시 동대문구 무학로 124 (용두동)', '서울특별시동부병원', ST_GeomFromText('POINT(127.03140257525507 37.57539886464885)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100040', '$2b$04$PRDjNcY7NdstddwcjW2/l.iwvwOz4B76Wyz/vrzw49za6YcZmpbya', '392cb360-0c73-4057-b11f-e1b45b7bcbac', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4937184009319, 126.92404876254014, '서울특별시 동작구 보라매로5길 20 (신대방동)', '서울특별시보라매병원', ST_GeomFromText('POINT(126.92404876254014 37.4937184009319)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100223', '$2b$04$ugZk21YbhjKLdqE9/oOVzemQvUoi0JDg5o9Nf6DdgYd3e./eWRZBe', 'bac671de-a8d8-4a67-953c-f929fcd86edc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.51201935883779, 126.8331299304024, '서울특별시 양천구 신정이펜1로 20 (신정동)', '서울특별시서남병원', ST_GeomFromText('POINT(126.8331299304024 37.51201935883779)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100035', '$2b$04$U42IDcrynB9mnPiT7g9DS.Ja/QrqusmtxdtkBp/Nl.TpNwevGVv6e', '483acc68-032f-4a13-b435-f3c6877e3b8e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.61286931510163, 127.0980910949257, '서울특별시 중랑구 신내로 156 (신내동)', '서울특별시서울의료원', ST_GeomFromText('POINT(127.0980910949257 37.61286931510163)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100172', '$2b$04$IoNINAbtYe67dvctpbXQJunzgR94gtPRckBLskKPSr6t6nUNo3H8W', 'fdbf4209-809a-439e-b684-4e07060f33d8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.6402559204261, 127.028504374531, '서울특별시 강북구 도봉로 374 (번동, 서울현대병원)', '서울현대병원', ST_GeomFromText('POINT(127.028504374531 37.6402559204261)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1502006', '$2b$04$oTB.Yg1B75zbpstDRtCEye/bhwjIrSEOwrkn7HpJyqmJVxGiAGqB2', 'd243355b-7b31-4e62-9da4-3f81c55dfb06', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.161551665649306, 126.88702689023857, '광주광역시 서구 무진대로 975 (광천동)', '선한병원', ST_GeomFromText('POINT(126.88702689023857 35.161551665649306)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600019', '$2b$04$Ud2Xs5w/hzdERPOm/w94weCmNrH0c5AvNx2l9GFbL1f19Q.oXT/JO', '1d7b4688-3002-402d-9ed2-ef3a317e8a82', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.9634252378637, 127.542308899549, '전라남도 순천시 순광로 221 (조례동)', '성가롤로병원', ST_GeomFromText('POINT(127.542308899549 34.9634252378637)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2116806', '$2b$04$KTQK.HP1wfrpWf//n53/kOtCiObELnKQ/yQxdK4JE6zB0WLg1pPYi', '4ac20dba-2689-4dd7-8b0f-7df3a79998fc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.44498428779224, 127.13905704599767, '경기도 성남시 수정구 수정로171번길 10, 성남시의료원 (태평동)', '성남시의료원', ST_GeomFromText('POINT(127.13905704599767 37.44498428779224)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100011', '$2b$04$jPLaBooryNL9GcxLKa6ja.IxYwnZgQjtmgqxiCcaYOpwaihH38W8q', '28dde62f-bfb4-471c-a50f-cfbaca503998', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4528032109466, 127.16209535008764, '경기도 성남시 중원구 산성대로476번길 12 (금광동)', '성남중앙병원', ST_GeomFromText('POINT(127.16209535008764 37.4528032109466)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2115807', '$2b$04$GXsaYgbyAvOEuqS4jw4LPOhPP7ahGW9WySNxSTb3DxsIDp31yeDky', 'b4312f44-d683-4fc3-85fd-e6a2c178c6be', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4344473895, 127.1282853418, '경기도 성남시 수정구 성남대로 1171, 삼성화재빌딩 1층일부, 2~9층 (수진동)', '성모윌병원', ST_GeomFromText('POINT(127.1282853418 37.4344473895)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100028', '$2b$04$lGrniV43aPXl9332IP7dyeGikwrq07La4TkvIIcnOwfpybyfuWxGO', '48c06c25-fdc9-4753-8211-989b7469a6b4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.53598408220376, 127.13526354631517, '서울특별시 강동구 성안로 150 (길동)', '성심강동성심병원', ST_GeomFromText('POINT(127.13526354631517 37.53598408220376)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100255', '$2b$04$ZVf5U52L3k.b.WRynlj1JOJ6K/nNJyG24RahHYHFOqhbM8aR0G5iC', '7cda9ae6-1bd4-47b7-a073-b75bb1515081', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.9840021910249, 126.92773248728594, '경기도 평택시 안중읍 안현로서6길 16, 성심중앙병원', '성심중앙병원', ST_GeomFromText('POINT(126.92773248728594 36.9840021910249)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100054', '$2b$04$bktzmlG31XIAb6iyPQgnZOAfXFpOQtdCag/TP05IBKPnA/f40bBAi', 'f4dcf405-c336-4548-afcd-b110e52513cc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.51205044957338, 126.92236733617031, '서울특별시 영등포구 여의대방로53길 22 (신길동, 성애병원)', '성애성애병원', ST_GeomFromText('POINT(126.92236733617031 37.51205044957338)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700030', '$2b$04$IBsAbc0GVhUQFDmrRqYPL.5F65lMcw/PHoFKwjpsaOaBlDhNAk1zi', '9f6c8f87-42df-454c-853e-befbe940f6ac', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.91869489182473, 128.28669967111344, '경상북도 성주군 성주읍 성주읍3길 5-3', '성주무강병원', ST_GeomFromText('POINT(128.28669967111344 35.91869489182473)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100032', '$2b$04$rFr.hW8tRAbof4DaR/jmk.aaSqxOTz7MdLv3SbwZQg1oINNtM5PiG', '84a133b1-fc31-4dfa-abfb-ef2851c4610f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.57534016994642, 126.9577071892358, '서울특별시 종로구 통일로 256 (무악동)', '세란병원', ST_GeomFromText('POINT(126.9577071892358 37.57534016994642)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200081', '$2b$04$/HFAPSTXB7rTgcOeAO9egOwhyB6zv5cM4DZjvzEdZXZSmKxJa8ASO', '1f59e59a-efc0-45a6-8113-8ba0eb689775', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.214424760113644, 129.10408278932294, '부산광역시 금정구 서동로 162 (서동)', '세웅병원', ST_GeomFromText('POINT(129.10408278932294 35.214424760113644)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200111', '$2b$04$OTYUjhloEC3olbZTe44J4utRmJMiL45CnWrvFAlvkZzbqUnjCexY6', '98064787-fe27-4765-9e13-dbf096fe805d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.12484866424028, 129.0445941872797, '부산광역시 동구 중앙대로 317 (초량동, 세일병원)', '세일병원', ST_GeomFromText('POINT(129.0445941872797 35.12484866424028)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100194', '$2b$04$VBx0vxxCkEcez3pxGohWqubrv4dZoz2VQdA97sdJh2j/MsyPkhVLG', 'f98e574b-9a04-4732-8abb-c54d64d42e55', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.3013258027, 127.6267201581, '경기도 여주시 청심로 39, 세종여주병원 (하동)', '세종여주병원', ST_GeomFromText('POINT(127.6267201581 37.3013258027)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1800441', '$2b$04$lIgKmjattSP3RBoOYfGqcOMLQkxXNGi1TpJfALNr/slJPzbmxKGO6', 'a6d26118-b836-401f-98cd-7f519ed09e6e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.5195133641377, 127.257942661368, '세종특별자치시 보듬7로 20, 세종충남대학교병원 (도담동)', '세종충남대학교병원', ST_GeomFromText('POINT(127.257942661368 36.5195133641377)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500071', '$2b$04$1ftEpP9Cubex5dkSfyCuiuLA3FF10YfluiwJVGbHm./JrwWbQ1tyC', '9b48c152-2910-4e67-98ca-afc15d9ddad0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.13421179794, 126.79736841847566, '광주광역시 광산구 송도로 232 (송정동, 송정사랑병원)', '송정사랑병원', ST_GeomFromText('POINT(126.79736841847566 35.13421179794)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100206', '$2b$04$vI01QYQpIsQfaxjhRUjPVuNwR/zjNmvYsfIfBiTxyeJErbJG9X0XS', 'a22aa8b1-b07f-4623-ae85-4271cf48fc3b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.259913344591446, 127.0228408488501, '경기도 수원시 권선구 권선로 654 (권선동)', '수원중앙병원', ST_GeomFromText('POINT(127.0228408488501 37.259913344591446)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2500021', '$2b$04$Y81ZkktKIUUmAhcMHjp5vequKt50qgZfibxmit4J6ZjEBwiaq/0Qi', '386baade-2df4-4017-ac2b-b511e266a545', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.3670362953963, 127.143667225508, '전북특별자치도 순창군 순창읍 교성로 135 (순창군보건의료원)', '순창군보건의료원', ST_GeomFromText('POINT(127.143667225508 35.3670362953963)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100016', '$2b$04$md9L5k6KEnj92/YIMi0FSeN9Tkn9p2.A76iVmrGAW7bdgEdTSvXju', '2aa5b815-a6ff-4ceb-8961-be87baa28877', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.43962497395649, 127.12863916535001, '경기도 성남시 수정구 수정로 76, 지하3~10층 (수진동)', '순천성남정병원', ST_GeomFromText('POINT(127.12863916535001 37.43962497395649)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600008', '$2b$04$p55EIMcwxtxz.e5BPsMrguqNwJzzC86n.1khf6SiaPucyLEedmHoS', '8cd09977-51e2-46d0-bbd2-efd254c33988', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.95422459893048, 127.52385648056844, '전라남도 순천시 기적의도서관1길 3 (조례동)', '순천제일병원', ST_GeomFromText('POINT(127.52385648056844 34.95422459893048)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600004', '$2b$04$gbzXw2lMpwdi4MBp1GJh3.LlGKtcPvbEkqURoAof/jcd10u6VYjxi', '0c9a31fc-6fd8-464c-b01e-de90118fbb64', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.95165645129011, 127.4844113418781, '전라남도 순천시 장명로 5 (장천동)', '순천중앙병원', ST_GeomFromText('POINT(127.4844113418781 34.95165645129011)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100004', '$2b$04$Mq7s3ZlkWXV2bzsYx72JP.pErfUzAbJo3TQ6t7K9loE/r7u08xYOW', '355b4401-1a64-4ad5-9fa1-e4c852b706ec', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.53384172231443, 127.00441798640304, '서울특별시 용산구 대사관로 59 (한남동)', '순천향대학교 부속 서울병원', ST_GeomFromText('POINT(127.00441798640304 37.53384172231443)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700013', '$2b$04$EmX0IPtA8go5IzW7EFbrS.JFFPyNC6nJhG6eabGW3rHiGfwBb4.I.', '2feb463c-0e20-490b-a760-c3300404e176', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.10286857919866, 128.38265476387454, '경상북도 구미시 1공단로 179 (공단동, (공단동))', '순천향대학교부속구미병원', ST_GeomFromText('POINT(128.38265476387454 36.10286857919866)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100005', '$2b$04$3r9EW.xfNiKdsBWNpIVuUOU2Xy4Doj9BUAY7ZqHvYCljnmzjoB6VK', 'f5ad5bd8-afaf-464d-b543-806c1eb3a0d7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.49857073407877, 126.76238239812001, '경기도 부천시 원미구 조마루로 170, 부흥로 173(1층일부) (중동)', '순천향대학교부속부천병원', ST_GeomFromText('POINT(126.76238239812001 37.49857073407877)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800138', '$2b$04$MqTsQhOss0RQ4b4JO15laeV/O1cXSsj6NX4GyTC6gPDwzUPEXTkni', 'ede0c0fd-d2c0-48cb-9f3e-662fd3c7d42b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.308982637512486, 128.51554361153526, '경상남도 함안군 칠원읍 용산2길 45-13', '시영 영동병원', ST_GeomFromText('POINT(128.51554361153526 35.308982637512486)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500006', '$2b$04$nAPAKN9mmBzUlvx4SX8/gOYtPeuTcoCDtJhUS5SlRoO0YXA6Xai3e', 'd8edc23c-3278-4363-8259-6feb140d52f1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.177619444444446, 126.8298, '광주광역시 광산구 목련로 316 (신가동)', '신가병원', ST_GeomFromText('POINT(126.8298 35.177619444444446)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100063', '$2b$04$SJ2k1drlkb.ptyLxEzEFqOisQ7Of9omN.xOf/2OrF.p0/6TN5m2O2', '8d54ef97-4665-489e-86b5-bcbb6fba016d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5525892651719, 126.933734666413, '서울특별시 마포구 서강로 110, 지2층~6층 (신수동)', '신촌연세병원', ST_GeomFromText('POINT(126.933734666413 37.5525892651719)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100045', '$2b$04$AFDRoIErtsd.FAAo4BOMPeFe4uAhT/YNS.k6MI.pPrQr0S3zO.7/2', '43d0a72f-28f7-43ed-bc3e-03ae98276fba', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.518848328762154, 126.90367981067837, '서울특별시 영등포구 영등포로36길 13 (영등포동4가, 충무병원)', '씨엠병원', ST_GeomFromText('POINT(126.90367981067837 37.518848328762154)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2402257', '$2b$04$cKTCvgXyAzJfoAkkjHSn3ulvYtn1G1yu7/06X4GA56rJx0XwbKGei', '0ec3d0b0-f3d3-48b1-a70b-4784537a3da8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.779292504897654, 127.01994885495239, '충청남도 아산시 문화로 381 (모종동)', '아산충무병원', ST_GeomFromText('POINT(127.01994885495239 36.779292504897654)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100002', '$2b$04$3LL.X43sUBsQQSBN5C9DauBevJPR1YEGcRVXATbtzN9M8wGkgll9m', '84f73dfb-bfba-4975-827d-ae3107274606', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.2794477573662, 127.04752107106702, '경기도 수원시 영통구 월드컵로 164 (원천동)', '아주대학교병원', ST_GeomFromText('POINT(127.04752107106702 37.2794477573662)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700004', '$2b$04$BqQ6GGnFexpaRpNoHVOX1.LLW/jjmNu.hwKHiTWR9iNgftYPAhaDW', '20b6c27b-2ef7-4d6d-a237-ed8a350ff1f5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.56712693337398, 128.72245351866204, '경상북도 안동시 서동문로 99 (금곡동)', '안동성소병원', ST_GeomFromText('POINT(128.72245351866204 36.56712693337398)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100305', '$2b$04$mtSVn2Ztjk8mho4wfYhvruQ64H3//RXjeb9O/IqyFagYE9Eai1lcq', 'd11ffede-0a3a-4fee-b067-940ac327c374', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.00610345894585, 127.2708442991513, '경기도 안성시 시장길 58 (서인동)', '안성성모병원', ST_GeomFromText('POINT(127.2708442991513 37.00610345894585)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400013', '$2b$04$vLqu5C73La9HOw1kcFr7fOs8pCNUOItR5c5bLWdVRaompTwLgqwdS', '74e3bc58-f9ac-4bda-accd-a3160c559ed1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.50684250997099, 126.71994675790395, '인천광역시 부평구 부평대로 175 (청천동, 세림병원)', '안은 부평세림병원', ST_GeomFromText('POINT(126.71994675790395 37.50684250997099)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800011', '$2b$04$syAPWVsYB.x.Ag3i7u3PPOJpazWVDTcSuFGng/mvQh8rBphhynHU2', 'ee3e42f6-fed8-4b17-a04f-61238c76cb2c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.32781996751182, 129.00588613550423, '경상남도 양산시 물금읍 금오로 20', '양산부산대학교병원', ST_GeomFromText('POINT(129.00588613550423 35.32781996751182)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100134', '$2b$04$QjtLOJtmFS./K4WP77FEIO1/i84wpLKWLFQB/RpEeeksxgip.FU2K', 'eb06412e-5342-4e69-8dbe-6534cad4ad28', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.83756356362081, 127.06463890111564, '경기도 양주시 회정로 103 (덕정동)', '양주예쓰병원', ST_GeomFromText('POINT(127.06463890111564 37.83756356362081)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100089', '$2b$04$9eauZTKOVpGRiGuc8zXqp.G00yGvwHxujNm0fzNvNFJWJIRCEOzCu', '763b4666-7903-499c-ac46-8c79a84a09a3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.493962635485616, 127.50347093330032, '경기도 양평군 양평읍 중앙로 129', '양평병원', ST_GeomFromText('POINT(127.50347093330032 37.493962635485616)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700008', '$2b$04$5vPz84Gcuu6EMpgy87osQeEES07LKH.z5dFWo6q6.FLFCgVE7.Vli', '9359b0c9-0c0c-4520-9317-7811d7528abe', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.0348228983, 129.3314002552, '경상북도 포항시 남구 희망대로 352 (이동, 에스포항병원)', '에스포항병원', ST_GeomFromText('POINT(129.3314002552 36.0348228983)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100282', '$2b$04$AiE6uBk7Yj67CCRtIgQ1VunEoquFl/mkYV3d/nMqb8Uj3d0oJpaAy', '03fd865a-6b63-4382-b861-8aa99c241d1d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.69104512763415, 127.52141322182567, '경기도 가평군 설악면 미사리로 267-177', '에이치제이매그놀리아국제병원', ST_GeomFromText('POINT(127.52141322182567 37.69104512763415)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2118188', '$2b$04$IJgQ3Vdxf5EXpCK462UbGukcFU7eu4cBL0lPEdj//NlJsQzC3V0V.', '0db33af2-08bc-4583-8d88-415506534e07', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.6487334911668, 127.141048740049, '경기도 남양주시 퇴계원읍 퇴계원로 20, 지하2~지상7층 일부제외호', '엘병원', ST_GeomFromText('POINT(127.141048740049 37.6487334911668)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600010', '$2b$04$siaJZqGxnvVlDNFzF.P9XufDCfJPAMCi89t82BbRGXQQux3TK2iwi', '6d639a7d-5c92-49e7-9ed4-acc0289aff6f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.74501919502327, 127.72808408876027, '전라남도 여수시 좌수영로 49 (광무동, 전남병원)', '여수전남병원', ST_GeomFromText('POINT(127.72808408876027 34.74501919502327)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2601742', '$2b$04$22/JIznEYsdlSMVHcLdxvuPiL1Q6r.HnnyqUkqZIgDnItSyg/ibQm', '4b81f2f1-b9c2-4c08-8397-0c07ff7474c9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.761243178966986, 127.67509537253795, '전라남도 여수시 여천체육공원길 10 (신기동)', '여수한국병원', ST_GeomFromText('POINT(127.67509537253795 34.761243178966986)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600014', '$2b$04$AsmM7mLb52bOJzWperWUSe6NnGqipK219L9dp2KkPECBGtKtSKEyK', '4d4c63b2-4ba5-4ecb-9a2f-a90c12d539bc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.76918041182927, 127.65404273510529, '전라남도 여수시 무선로 95 (선원동, (선원동))', '여천전남병원', ST_GeomFromText('POINT(127.65404273510529 34.76918041182927)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200001', '$2b$04$ALKR1uYY/4RMHa4JR8bDv.S58qo15ES7qQfaSUOAtNBo8QitS7z9a', '2a93961d-d7a7-4ff0-8637-d6c53f1939b6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.34795543031888, 127.9456453098751, '강원특별자치도 원주시 일산로 20-0 (일산동, (일산동))', '연세대학교원주세브란스기독병원', ST_GeomFromText('POINT(127.9456453098751 37.34795543031888)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100015', '$2b$04$eGFuQnRUwP8Lplne4n5d6.tH1pDQBupresDpKPlU1IzkM.OWUaKHO', '2aa906ac-7a4b-43ee-9ab8-35cb8372a188', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.492806984645476, 127.04631254186798, '서울특별시 강남구 언주로 211, 강남세브란스병원 (도곡동)', '연세대학교의과대학강남세브란스병원', ST_GeomFromText('POINT(127.04631254186798 37.492806984645476)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100007', '$2b$04$9ydW2XW9Pp0hvGpzIOr0qeeq8/uHwz3XVns7pPagWv4OdcHS3DJUm', '2872bc5f-0830-401e-9fb3-b80906af06e0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.56211711412639, 126.94082769649863, '서울특별시 서대문구 연세로 50-1 (신촌동)', '연세대학교의과대학세브란스병원', ST_GeomFromText('POINT(126.94082769649863 37.56211711412639)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100020', '$2b$04$Sm50AToAOdNjQVembBd8tustOCKf.ZpqLFshVjx7UDgJJX0bP6Lgq', 'bdda9fa8-9fd0-4e43-87ff-83d98092a39e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.270775831978774, 127.14818862464037, '경기도 용인시 기흥구 동백죽전대로 363 (중동)', '연세대학교의과대학용인세브란스병원', ST_GeomFromText('POINT(127.14818862464037 37.270775831978774)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100173', '$2b$04$y5Xvo1lgLlQC2QqaDOjStu/G7b6pOUA8yT7FrRNiDF5nh.zUg/bHa', 'e8174bdf-876f-4eb5-8342-7b87418318ed', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.289871650589454, 127.63287952191527, '경기도 여주시 영릉로 22 (창동)', '연세새로운병원', ST_GeomFromText('POINT(127.63287952191527 37.289871650589454)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800021', '$2b$04$V6ICfQ/r/Eyu6/QVEytUVez5wKagEnmnqTyjIk1GAYX32sEgwZeuG', '7e71e0d4-5528-46ac-aa2a-e7f0229a8c92', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.1547321003, 128.6983352518, '경상남도 창원시 진해구 해원로32번길 13 (이동)', '연세에스병원', ST_GeomFromText('POINT(128.6983352518 35.1547321003)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2100187', '$2b$04$ymkLj.95QuFwG8AqKCosk.NhQteTnMeORVpCCo2oUkbTuEvQacaOq', '4d0f0e56-3f1f-40e8-9a5d-b6a24d9fe2b7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 38.02374166666665, 127.06124444444444, '경기도 연천군 전곡읍 은대성로 95', '연천군보건의료원', ST_GeomFromText('POINT(127.06124444444444 38.02374166666665)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600015', '$2b$04$M9ixUaIgqJgZZ5u3iErhr.UxB.Svhaen1yJmzi5maHXkvCw10F1Jm', '1915c324-4656-4955-9cc8-4c711c881c69', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.2841836238628, 126.498940298383, '전라남도 영광군 영광읍 와룡로 3,', '영광종합병원', ST_GeomFromText('POINT(126.498940298383 35.2841836238628)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300001', '$2b$04$Usrp3xDlvgwPNjDXkcWF2ukcn4me1ByGGL5dq5GEhFsBXCZ.ZwI46', 'be19f612-fb1d-4680-a9af-2df91dae8e6d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.84750592025217, 128.58513118547506, '대구광역시 남구 현충로 170 (대명동)', '영남대학교병원', ST_GeomFromText('POINT(128.58513118547506 35.84750592025217)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700017', '$2b$04$77MYsiKDsA5zPexjih1waev4/LqlbPEMhIme41vXA2ePzv20YLWF6', '97eaeb48-5a9d-4f5d-869e-9aa411019a5c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.957320739100794, 128.91305328332228, '경상북도 영천시 오수1길 10 (오수동)', '영남대학교의과대학부속영천병원', ST_GeomFromText('POINT(128.91305328332228 35.957320739100794)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700073', '$2b$04$XP7nXmr4e1CM4DnyWu7x9.IjHHGESF8EbrAVcGymwt/BSqWFYBnFi', 'f01e0941-fea7-491c-acee-f09701e44669', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.52464784739123, 129.4022978175491, '경상북도 영덕군 영해면 영덕로 1621', '영덕아산병원', ST_GeomFromText('POINT(129.4022978175491 36.52464784739123)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200014', '$2b$04$eODuK0xelRM5Rx1PPI1PxuEDgG3XTL4fo23b0PrT0ifyZFR5yeTx6', 'b904a13c-af21-496e-9661-29e1f6e78b80', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.09227119620571, 129.04053714557975, '부산광역시 영도구 태종로 85 (대교동2가)', '영도병원', ST_GeomFromText('POINT(129.04053714557975 35.09227119620571)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600070', '$2b$04$fyt1Z3PKKbYG.lFyjjR2N.H9Gq8SAfQ4bjxRt30wwwH6qZyBMxqCC', '06a0efc9-7d56-495a-b2e3-ed7a8d1209a6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.794341315816496, 126.70116990992958, '전라남도 영암군 영암읍 오리정길 8', '영암한국병원', ST_GeomFromText('POINT(126.70116990992958 34.794341315816496)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700031', '$2b$04$jN6CJmCnQhRbW0uLeZs3nelVLaGGyrGdjddPjP.tRU69qIoK7yg4m', '4edb4bdf-1de2-458d-a6a1-d4a09bc0ac27', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.82516126894279, 128.62114810991983, '경상북도 영주시 구성로 380 (영주동)', '영주기독병원', ST_GeomFromText('POINT(128.62114810991983 36.82516126894279)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700020', '$2b$04$BrjUjtQUK6bYKoq6SIYtGuZwaWa70FKKHAVWzWgnz91qqo5tX3uJ6', '7a12b1d1-ea4d-4a24-b5dd-198d1544e3ef', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.815947445861305, 128.60561041705353, '경상북도 영주시 대동로31번길 9 (가흥동)', '영주자인병원', ST_GeomFromText('POINT(128.60561041705353 36.815947445861305)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2702752', '$2b$04$/2yoCcWkDAewI7yKcANBDee95u2myMlmo0k14r5RaB..m.ITCkipC', '52014a2e-581f-45f5-905a-5cd80b9ee12b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.8252579707, 128.6040034927, '경상북도 영주시 대학로 327-0 (가흥동,영주적십자병원)', '영주적십자병원', ST_GeomFromText('POINT(128.6040034927 36.8252579707)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400015', '$2b$04$2yuza4DPP2EWU.nay2IDI.kH.dVl3QZRewqyP0O3fF87WYcB6k9da', 'ffe1c8d7-b02a-4622-97b4-4d93d9fda0f7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.71373026149238, 126.83416958942115, '충청남도 예산군 예산읍 신례원로 26', '예산명지병원', ST_GeomFromText('POINT(126.83416958942115 36.71373026149238)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100024', '$2b$04$OO9L4333c5bnYpBn5tMaVuF3oSYS0To.sXUubyt7cq6xWIeecmg9C', '4933f63f-6a7a-4cf6-84cb-17686c0de296', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.14122844920573, 127.07533756274843, '경기도 오산시 밀머리로1번길 16 (원동)', '오산한국병원', ST_GeomFromText('POINT(127.07533756274843 37.14122844920573)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300021', '$2b$04$Lig0OVOgCvLbdTqaJMWfQemlabw6hxQFEIKI1B4QMmVgY6kJqpFNK', '7d22c8c3-d56a-4f29-8f5b-49cbd7e8247b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.70680258158961, 127.42965176665307, '충청북도 청주시 청원구 오창읍 중부로 683', '오창중앙병원', ST_GeomFromText('POINT(127.42965176665307 36.70680258158961)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400005', '$2b$04$7qlCUaTpBxizIvj809U2DuMBGTJs3nQhcPIpGmK5LsKeU6330zdEG', '708a790c-5bb8-4acc-b50e-4b54ec672ea5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.60280557009656, 126.65430866269227, '인천광역시 서구 완정로 199 (왕길동)', '온누리병원', ST_GeomFromText('POINT(126.65430866269227 37.60280557009656)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2600362', '$2b$04$IJCWknWiCms0g8wx8xTl/OWp9bO02VnMoOinjGbvy1D/AjiKRQING', '9a99ecdc-fad6-4c74-988b-2bd6015a6208', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.17730585378432, 126.57093792042261, '전라남도 완도군 노화읍 노화로 813, 노화보건지소', '완도군노화읍보건지소', ST_GeomFromText('POINT(126.57093792042261 34.17730585378432)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600032', '$2b$04$jr.BWJZwCo3vLDzuZgAqyOVna.0Jx..j4xo3QEhIicc2gmdVQnk3W', 'd7e39ebc-665d-49c6-b563-ddc2114be9fb', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.31716999454396, 126.73556371420688, '전라남도 완도군 완도읍 청해진동로 63', '완도대성병원', ST_GeomFromText('POINT(126.73556371420688 34.31716999454396)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100042', '$2b$04$ntMiT5RLt4Z6grRaCabkBOc/Sw1nTXru9.8HcVuTMPltPD9o99Mge', 'ff9d531b-eb78-4777-b54e-a56e78d196a3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.56199597494205, 126.7963653099318, '서울특별시 강서구 하늘길 70 (과해동)', '우리들병원', ST_GeomFromText('POINT(126.7963653099318 37.56199597494205)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500010', '$2b$04$qlisuGVDoA2ELiF85sQcReT1rPRuJpJBdNK9QLeZuAY.KQdqWFasO', '7f10aeef-2965-4830-99ce-d6a9970dc1a6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.18513334103592, 126.86956982285518, '광주광역시 북구 북문대로 191 (운암동)', '운암한국병원', ST_GeomFromText('POINT(126.86956982285518 35.18513334103592)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2700553', '$2b$04$WMRZ/b3F/BFj2kl5Te3EBe8CuYOdpuYFlKV4fpj7X3sYz7WrSoUJW', 'c00c730b-9e1a-4ac7-9529-72de58bc3a7d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.485886024545444, 130.89947707708177, '경상북도 울릉군 울릉읍 울릉순환로 396-18', '울릉군보건의료원', ST_GeomFromText('POINT(130.89947707708177 37.485886024545444)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700003', '$2b$04$PQiAqDJG7C/iuHzOpztyUOJDZYNgmfR8UG7GhpT3oiD8BxDGxgN66', 'cbc35f97-4c83-4c12-9aa9-1c0db5e2074c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.54621707569275, 129.32309962689618, '울산광역시 남구 월평로171번길 13 (신정동)', '울산병원', ST_GeomFromText('POINT(129.32309962689618 35.54621707569275)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700007', '$2b$04$rk9Gg/QC2vcjcnYR0Wafou2pcSkkKIBQCuVkyexzZjVXMxsFS1z62', '49fde53d-ed14-441f-84fd-538c5b7a14bb', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.62891129475159, 129.350630148322, '울산광역시 북구 호계로 285 (호계동)', '울산엘리야병원', ST_GeomFromText('POINT(129.350630148322 35.62891129475159)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700052', '$2b$04$BvRZPBslIg8bImza2IUsgeYBKOLsKvNI7FJs.tdQ.giSot1jebDmG', '654d4d05-4a1a-4e48-ae63-a5a8d12e3dac', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.99264955966117, 129.40949155236495, '경상북도 울진군 울진읍 현내항길 71', '울진군의료원', ST_GeomFromText('POINT(129.40949155236495 36.99264955966117)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500001', '$2b$04$cAcEaVyx8JBvC95Z13yPV.6dkkmqqTGFESEEuwS63UtSp2Uaxjuaq', 'ab026e6b-1e13-4cb3-a86f-46ba73483bff', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.9642419612473, 126.959306346821, '전북특별자치도 익산시 무왕로 895 (신동)', '원광대학교병원', ST_GeomFromText('POINT(126.959306346821 35.9642419612473)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100048', '$2b$04$QYH2A5GG9fjyDq2lOthVAeFfACWle/qkXIC8EQ6kdVAk4fpxAbivC', '4a5631a8-d1fc-442c-aa7b-a224c37fb661', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.359787179442414, 126.93330716393871, '경기도 군포시 산본로 321 (산본동)', '원광대학교산본병원', ST_GeomFromText('POINT(126.93330716393871 37.359787179442414)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100208', '$2b$04$uqJMwYQC7ONFrs6nmbWCo.dnZICiKvyuqfBjjQRIU/M4npKToaDOq', '0ae2a40d-adfb-4fb0-98b2-b4ca3cfb978f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.651957172510606, 127.30437739416752, '경기도 남양주시 화도읍 경춘로 1943-16', '원병원', ST_GeomFromText('POINT(127.30437739416752 37.651957172510606)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200030', '$2b$04$kA3IWDWra71avE2rMXZr9ukUrt/OwTWDejbUVHr8yeD37UJIoP8Em', '57e22270-d16d-4f22-b6be-e0af84ac183b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.39364611118348, 127.9845808143955, '강원특별자치도 원주시 소초면 치악로 2473', '원주성모병원', ST_GeomFromText('POINT(127.9845808143955 37.39364611118348)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100116', '$2b$04$ReQ9MTcKSZztKtpOChSEKOnfjeZ8m2tgB2FXQRpr9UluvrWONO18i', '95d1dac8-db1b-4799-8ca4-824262d66a79', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.60519852568096, 127.13961137900537, '경기도 구리시 건원대로 47 (인창동)', '윤서병원', ST_GeomFromText('POINT(127.13961137900537 37.60519852568096)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100152', '$2b$04$VeiX9KKHj87ruh05l2K0RuATGl0OGSb3ghXL0hFVyIybLRG387uTe', 'fb68ecfe-39f5-48ad-85d9-3d9abfa04e53', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.6146922208583, 126.917472218592, '서울특별시 은평구 연서로 177 (갈현동)', '은평연세병원', ST_GeomFromText('POINT(126.917472218592 37.6146922208583)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700019', '$2b$04$.Lmf38kTHfH6Tp0TlPY51elsXtuwOUWTppnfpLrY/h2Eq.cbAJ4Lm', '60f12915-8cc6-4788-ac80-ac37b1063330', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.80882731345708, 128.7401572913474, '경상북도 경산시 경안로 11 (백천동)', '의)근원경산중앙병원', ST_GeomFromText('POINT(128.7401572913474 35.80882731345708)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800090', '$2b$04$Q5TstpRJVNDxq1BofDYrfe5XaJb08rBBRMQkJrAWbNJ7WKzTIlINy', 'b6ec949b-81b2-4665-8e3f-6f62d7064c9d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.31860563079656, 128.2586798056445, '경상남도 의령군 의령읍 의병로14길 10', '의령병원', ST_GeomFromText('POINT(128.2586798056445 35.31860563079656)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200139', '$2b$04$80iHfZSSOSxNFmU0SX/Cy.z9Mp8SGg77WOonY9KNIoqzh3nSxeUKu', '7618c73d-2dad-4127-b60c-4d5a8f2fd1c5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.090573808412124, 128.85332092602835, '부산광역시 강서구 녹산산단321로 24-8 (송정동)', '의료법인 갑을 갑을녹산병원', ST_GeomFromText('POINT(128.85332092602835 35.090573808412124)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600034', '$2b$04$eR9iBqaEJY4o/iejTdqiLOUxi2AE2gG3/norSHbZkMFRBfYpxQ0mC', '89614e4f-a270-4f7a-9d83-b19cf71f26a0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.274959355007304, 126.5108758767997, '전라남도 영광군 영광읍 신남로 265', '의료법인 거명 영광기독병원', ST_GeomFromText('POINT(126.5108758767997 35.274959355007304)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800008', '$2b$04$uji93J9OztoHDusZKSPNZeqCtT7Fh.D1FIA.heYfWScWYDQap17LS', 'd7f9b8b4-b246-42e7-a87d-595bf72418c6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.873675809023304, 128.62605696825915, '경상남도 거제시 계룡로5길 14 (상동동)', '의료법인 거붕 백병원', ST_GeomFromText('POINT(128.62605696825915 34.873675809023304)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200009', '$2b$04$kHIAuinxOLxkTRLWY6Gz4.Ilsh7HC.vlX4VGPJmpKoQGaHusuBXvu', '96781daf-addf-40ee-86d1-98290dc08f7b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.207033333333335, 129.07113611111112, '부산광역시 동래구 충렬대로 96 (온천동, 광혜병원)', '의료법인 광혜 광혜병원', ST_GeomFromText('POINT(129.07113611111112 35.207033333333335)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400001', '$2b$04$UTvV0P7cSW4QkInLLgl7DOZ7ad3Y0f6tIFstQc2emRnu73exgtMfe', '1cf3bd4b-cdfc-4717-b307-2bc59eb898f1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.45208024654252, 126.70916173607195, '인천광역시 남동구 남동대로774번길 21 (구월동, 가천대학교길병원)', '의료법인 길 길병원', ST_GeomFromText('POINT(126.70916173607195 37.45208024654252)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400011', '$2b$04$ScEDkdw7w/Ttu6X/WJPpAeAM4B0n0qGz9/LZwzJuaUKJcIY4AYEIm', 'c01f04a1-eda9-4341-94f6-30e6485f0d0f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4079911136402, 126.67046935782248, '인천광역시 연수구 먼우금로 98 (동춘동, 나사렛국제병원)', '의료법인 나사렛 나사렛국제병원', ST_GeomFromText('POINT(126.67046935782248 37.4079911136402)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400003', '$2b$04$R0DjR495db6kl56.5HhH3..4eBj4FoPdl32AFmj.aGN14DwF7ygGK', 'e83acc92-7d38-4259-8b9c-f81d6cb0efae', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4890534064866, 126.679450677348, '인천광역시 서구 원적로 23 (가좌동, 원적로 27번길 11(가좌동))', '의료법인 루가 나은병원', ST_GeomFromText('POINT(126.679450677348 37.4890534064866)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800015', '$2b$04$F.mHh/XUDQ3q4vUtC2IfwuM6PWrf9CODnhuaZRLxQRF0eO7LyExjm', 'ad0c38f1-9f7f-4268-84c9-0d0a89168a9c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.17849131749577, 128.09223855742437, '경상남도 진주시 동진로 2 (칠암동, 진주고려병원)', '의료법인 문병욱 진주고려병원', ST_GeomFromText('POINT(128.09223855742437 35.17849131749577)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800045', '$2b$04$546FX5Cy4BUfs6XwDuuPdu.twikrlkkwueUX3gr3IPPN/xKdcJmua', '5e5099d5-842e-4441-b622-c985a4c710d2', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.179208158439586, 128.09170475475878, '경상남도 진주시 동진로 7 (칠암동)', '의료법인 바른 바른병원', ST_GeomFromText('POINT(128.09170475475878 35.179208158439586)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800057', '$2b$04$3vfB58e156aTJiaog602C.8pB72CluXpQs0LfiPypNffHaAAMKKUG', '67565c5b-0151-4a58-bd10-35ff7bb3583f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.48468031922943, 128.75564526263582, '경상남도 밀양시 삼문중앙로 32 (삼문동)', '의료법인 생명사랑 밀양윤병원', ST_GeomFromText('POINT(128.75564526263582 35.48468031922943)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800022', '$2b$04$gSnZWNz1XS.l8tM0sB34g.BP19UitqOWUVanIgy2m9EPtt5Fe18nO', 'b06fab01-0634-46df-8a97-802d38b5f1ee', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.89793483097861, 128.64371778461182, '경상남도 거제시 연초면 거제대로 4477', '의료법인 성념맑은샘병원', ST_GeomFromText('POINT(128.64371778461182 34.89793483097861)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400007', '$2b$04$uFsyIxOTxTFfQsyrPKdDHuP2pTQL65bZmqjgL8xeb.3mCVrVI9MR2', '083bb8c2-692a-4b7e-9198-755ea0527c1e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4772581429266, 126.648504056866, '인천광역시 동구 샛골로 214 (송림동)', '의료법인 성수 인천백병원', ST_GeomFromText('POINT(126.648504056866 37.4772581429266)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200098', '$2b$04$w3eaLuXYschFDysc6oFATOaNaBgPe4YJKkiEjtRVdlPWLr64ZRbdu', '1f86a2be-d7f0-4650-ae9d-0a61c0efb9bb', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.16637129021226, 129.11466833709284, '부산광역시 수영구 수영로679번길 8 (광안동)', '의료법인 센텀 센텀종합병원', ST_GeomFromText('POINT(129.11466833709284 35.16637129021226)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1800417', '$2b$04$8AqCYlVQB5BKRf3waRu4MuMODOWD.535HWp.ra/816du7Xtj.Zwjy', '00080605-3e3e-4779-9b6b-062980b6415d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.47962250753158, 127.26225618927695, '세종특별자치시 한누리대로 161, 세종시 NK리움힐 상가 1~8층 (나성동)', '의료법인 영제  엔케이세종병원', ST_GeomFromText('POINT(127.26225618927695 36.47962250753158)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200020', '$2b$04$5SqfVdVhpAXspcV/BZXIMuSBGekB29VqM3C0DkPN14ArwTUj0yAzG', '2c1a176a-847e-4d3a-9874-e1a39877cdce', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.15787735996765, 129.04998435792845, '부산광역시 부산진구 가야대로 719, ,767,721,본관 지하3~11층 전부,12층 일부,13~14층 전부,15층 일부,신관 1층, 9층 일부 (당감동)', '의료법인 온그룹 온병원', ST_GeomFromText('POINT(129.04998435792845 35.15787735996765)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200008', '$2b$04$Uw/rMOVtNXiZO5.uzBbae.O3b1QAOKENB4ZVw3YrMSBvomFxc3qTm', '2c90e6fe-7660-43e2-b930-a051a52e26f8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.15015905669445, 129.11072434834875, '부산광역시 수영구 수영로 493 (남천동)', '의료법인 은성 좋은강안병원', ST_GeomFromText('POINT(129.11072434834875 35.15015905669445)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700011', '$2b$04$Be/pe3BR.LkAo/B9Bv.F9eniltO2ya.nlNXUaXbJh8lkpxONhY.PC', '3a7b9b56-b8e9-429a-9e9e-50e1a2ef3cc4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.55282641650826, 129.26899792409964, '울산광역시 남구 북부순환도로 51 (무거동)', '의료법인 은성 좋은삼정병원', ST_GeomFromText('POINT(129.26899792409964 35.55282641650826)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800094', '$2b$04$vOV/jLBk88mwvXit5rVn8.ELxawZ/6Y3/2ka4Ta3UTptSjyIAJOse', '986881a5-2f3a-49fd-9f56-e78753ba2613', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.84640603127717, 127.89425156305387, '경상남도 남해군 남해읍 화전로 169', '의료법인 이도 남해병원', ST_GeomFromText('POINT(127.89425156305387 34.84640603127717)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200006', '$2b$04$fUL7u0yNbHy6xG4VeVDPKevhSE3kKoKPZtjNdSG2/IZoIMoCz46ki', 'b12e7cda-a773-4904-aed7-0b336e575a80', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.211914318056756, 129.01121232860874, '부산광역시 북구 만덕대로 59 (덕천동)', '의료법인 인당 부민병원', ST_GeomFromText('POINT(129.01121232860874 35.211914318056756)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1205143', '$2b$04$OHQKnilKIBRwCk3r1e6OqOsms01ikQ3ENs5cd2OOTt1B6cJNw4GLC', '370dce6b-fc70-4770-be92-8fba7a24951c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.16142040775608, 129.1556561002225, '부산광역시 해운대구 해운대로 584 (우동)', '의료법인 인당 해운대부민병원', ST_GeomFromText('POINT(129.1556561002225 35.16142040775608)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100036', '$2b$04$W2DCuC0x3K10pzFqypg6LOdL5pBm5/3oaKTULwiFmr0Dejo1Ezk5a', 'e3cdfa22-606f-4bfb-9538-ca3da05a6f50', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.827495913257785, 127.1481437183119, '경기도 포천시 소흘읍 호국로 661', '의료법인 일심 포천우리병원', ST_GeomFromText('POINT(127.1481437183119 37.827495913257785)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200012', '$2b$04$HKkffxWK6aqlY4yy7xJ3OeTqfhkDPycGIuq2Ct5fF8RAya02U95Ya', '89c17f6b-df87-4fcc-8100-03668606136d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.09194298219175, 129.04386428258525, '부산광역시 영도구 태종로 133 (봉래동3가)', '의료법인 행도 해동병원', ST_GeomFromText('POINT(129.04386428258525 35.09194298219175)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2900003', '$2b$04$TiEYzO7f1ZmtxUtXbATo0OFjdj.EF9mUxxeCtL.Acp5kapCHE1M3m', 'faf8f81e-60f3-433b-a383-46465fb18be6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 33.500185921027, 126.51698873048466, '제주특별자치도 제주시 서광로 193 (삼도일동)', '의료법인 혜인 한국병원', ST_GeomFromText('POINT(126.51698873048466 33.500185921027)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100309', '$2b$04$EPQG/TvPgFnao9P9.F0J/.7wNaVssg7w9fakr59PRw3yP0jh/2K3O', '6829ce1b-9af2-451d-a98c-304382c5df50', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.0482647009, 127.05700385749999, '경기도 평택시 송탄로 33 (장당동)', '의료법인갈렌박병원', ST_GeomFromText('POINT(127.05700385749999 37.0482647009)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800014', '$2b$04$kc6/tq8C4euJYc3r.xSxcOzAofAJ0W2mptEBva5RjEhNjkm9mEImq', '68bd8def-4b94-4c86-b609-33f5cd33f9f4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.208667155880995, 128.80564300531228, '경상남도 김해시 장유로 167-13 (부곡동)', '의료법인갑을갑을장유병원', ST_GeomFromText('POINT(128.80564300531228 35.208667155880995)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200005', '$2b$04$CyUNAfQkYuza2C5GrIA0ye19LuKNHDg7yGPV21L9eyhPY8tsT/Bte', '4ac45462-6cfc-4c90-95f5-67dbd8139da7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.77432579461282, 128.90714180258507, '강원특별자치도 강릉시 강릉대로419번길 42 (포남동)', '의료법인강릉동인병원', ST_GeomFromText('POINT(128.90714180258507 37.77432579461282)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300013', '$2b$04$oBhg5CbkWzcS2Ugzc8dDM.zGSii2KpG6nnJ4HThf6EA0xbYfmNu0e', 'd5e136f7-12b7-4adc-aab0-15a1c38b758d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.858487476286044, 127.44050791116805, '충청북도 진천군 진천읍 중앙북로 36-0 (진천성모병원)', '의료법인건명중앙제일병원', ST_GeomFromText('POINT(127.44050791116805 36.858487476286044)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300006', '$2b$04$utXIXMagmuC8zA7BQcB.sOS9sCo6AyayjkMU9QVgB1GZAGupPRLse', '244ef84b-7357-47d4-a7e3-13b2d489cd10', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.85082313699737, 128.54148303217696, '대구광역시 달서구 감삼북길 141 (감삼동)', '의료법인구구병원', ST_GeomFromText('POINT(128.54148303217696 35.85082313699737)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100008', '$2b$04$2P9X2f.koZRlVJDwFVQ2au/Tby2SgQushufpGbD0EIFDJabZ67FSq', 'a47349e9-6a3e-4e03-9197-b996cb0395e0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.349955639806, 126.736970968751, '경기도 시흥시 군자천로 381, 시화병원 (정왕동)', '의료법인남촌시화병원', ST_GeomFromText('POINT(126.736970968751 37.349955639806)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100009', '$2b$04$IfhzbWM/iuuBIcCMbg9RLu/UZ8U6LtnKoZaKqeu.hw0Avw84CHo5W', 'bee686d1-6e16-455e-8721-89b7d9e6cc56', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.27816562305189, 127.0343637912553, '경기도 수원시 팔달구 중부대로 165 (우만동)', '의료법인녹산동수원병원', ST_GeomFromText('POINT(127.0343637912553 37.27816562305189)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300034', '$2b$04$HeRNT/KAyXVrHd7uKpx8rOdk2B6yUfHApp1zEKjnV.szZnGhzYlVK', 'fd53866b-58ad-4099-8e30-4fa20139ac0d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.81544387632933, 127.78424628538971, '충청북도 괴산군 괴산읍 임꺽정로 116-0 (괴산성모병원)', '의료법인대광괴산성모병원', ST_GeomFromText('POINT(127.78424628538971 36.81544387632933)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700038', '$2b$04$OOmdX/3yFD6jbA5gJcZMpeJcrTlpOwDGTY.6HOadvew4RmKscOBvi', '86a86b94-ece4-4b99-81b1-149242bb6698', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.64871261648798, 128.73711323398672, '경상북도 청도군 화양읍 청화로 79-7', '의료법인대남청도대남병원', ST_GeomFromText('POINT(128.73711323398672 35.64871261648798)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500011', '$2b$04$BJwkAXoNnnA02cRhxKh72u.uu7wQMTcRtdnTdUJl3qqQZaKgUknSO', '43d061e0-1ca0-4f4d-9f64-07638ca55fd1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.96168123354797, 126.96649966881398, '전북특별자치도 익산시 무왕로 969 (신동)', '의료법인대산익산병원', ST_GeomFromText('POINT(126.96649966881398 35.96168123354797)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800005', '$2b$04$lrWdz5N1nd6xBKMepzIGIeeoGHsLoVtg0EsvbBden/ma5ABomJ12u', 'd39ba6dd-350b-4745-9f38-e696a2b4cefe', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.87222152119712, 128.72216421007292, '경상남도 거제시 두모길 16 (두모동)', '의료법인대우대우병원', ST_GeomFromText('POINT(128.72216421007292 34.87222152119712)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100050', '$2b$04$V19D16TpPDJGW6mdbbMAIONJKyXbyT0ioq4.Fq7PWeeG4z2xsw1Cy', 'b782609d-283d-4f21-b449-ccf9689ecef1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.512321557883574, 126.76948894065183, '경기도 부천시 원미구 중동로 361, 다니엘종합병원 (약대동)', '의료법인대인다니엘종합병원', ST_GeomFromText('POINT(126.76948894065183 37.512321557883574)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700012', '$2b$04$BnZgQy/YdMDHfZ/SWXyjyehgbS03QlrJgqmLmpofhBvtkdC04bxbC', '5411ab7b-4259-4f23-88de-db37ff89c3cd', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.135341995663524, 128.11882383545816, '경상북도 김천시 신음1길 12 (신음동)', '의료법인덕산김천제일병원', ST_GeomFromText('POINT(128.11882383545816 36.135341995663524)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700002', '$2b$04$edYtBOWTrV6yl5q5wOne5.YOGf8vDetwbzhIicP7keuLfs.eaeeXq', 'd653c8b0-b133-47a4-87d1-2ba3cd874eee', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.55340950863559, 129.30194290200077, '울산광역시 중구 태화로 239 (태화동)', '의료법인동강동강병원', ST_GeomFromText('POINT(129.30194290200077 35.55340950863559)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1701489', '$2b$04$sPNC9skamBbo2XDV4Y6k9ekE3B8NtYujmdbp5TNidl.0QsJ3rbM3K', 'e20f61db-e58b-45d4-a6a8-49f1fa9b8f55', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.5685460268, 129.350477985, '울산광역시 중구 외솔큰길 215 (남외동, 동천동강병원)', '의료법인동강동천동강병원', ST_GeomFromText('POINT(129.350477985 35.5685460268)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100025', '$2b$04$uRI/VR0Z0r4SCx0S9QSDZO/Xpke.3/AGfqS84LzbiRa03ijFbAJNy', '3c093b3e-9231-4348-ae40-4e1b5633de99', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.58110428173239, 126.93658306608872, '서울특별시 서대문구 연희로 272, 동신병원 본관동 (홍은동)', '의료법인동신동신병원', ST_GeomFromText('POINT(126.93658306608872 37.58110428173239)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700006', '$2b$04$2FpyZrq1w.T8zc0bJ2ntrOVxhNwCJp45IpKIUk.lhJF977DCE4ApC', '0bf9279c-5c4d-4610-a9fa-74db6635a102', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.5848214366, 128.189771534, '경상북도 문경시 당교3길 25 (모전동)', '의료법인동춘문경제일병원', ST_GeomFromText('POINT(128.189771534 36.5848214366)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200003', '$2b$04$8UvG97ZsM7uWtjm7uY3jReibXEdWtYUYdj7/zJY9JbKUKfVWBuwkS', '7f251eb9-e379-4195-9397-c55fbbe4c4d9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.530006805605616, 129.1074043067605, '강원특별자치도 동해시 하평로 26-  (평릉동, (평릉동))', '의료법인동해동인병원', ST_GeomFromText('POINT(129.1074043067605 37.530006805605616)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100013', '$2b$04$I.WxVC0Ga2lvKeYnvFApCeOac.y2RRkhTPZisGBWDFGFTYQ6kJgPO', '0f69e2ef-aea7-484d-9563-f11483f1b02b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.44454605843136, 126.78938385106555, '경기도 시흥시 복지로 57, 복지로 61, 2층 (대야동)', '의료법인록향신천연합병원', ST_GeomFromText('POINT(126.78938385106555 37.44454605843136)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700026', '$2b$04$vf/JuDWXBYLHX6lxDSMREe149UeyTStuc.zykZbpyep0rnIOCJ2hm', '369bce4a-4292-431a-b988-5c92cf111775', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.66257764096643, 129.1173135291313, '경상북도 영양군 영양읍 동서대로 75', '의료법인명성영양병원', ST_GeomFromText('POINT(129.1173135291313 36.66257764096643)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2117135', '$2b$04$SGcVPFgRoa.B6ZFrqUIRTuqrc7jJGpqDeedAih0I/8Wwq1iysRyWy', 'f843efcd-7939-4668-b870-9cbe9e3df801', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.2601427452511, 126.963891671858, '경기도 수원시 권선구 호매실로90번길 98 (호매실동)', '의료법인명인화홍병원', ST_GeomFromText('POINT(126.963891671858 37.2601427452511)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100042', '$2b$04$nN4UyUuoGf4tVMavz7K1B.ucvBfxvHhNxC5r2fidXnoHy64HluHJ2', '1c3639a1-ab18-44e6-802a-37af68efa06b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.64207169115689, 126.83145733035825, '경기도 고양시 덕양구 화수로14번길 55 (화정동)', '의료법인명지명지병원', ST_GeomFromText('POINT(126.83145733035825 37.64207169115689)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300009', '$2b$04$cGK7mkE01dGFsOQfIz8/COZTYV43rPHGDho9iYj0lEdcLBPWUI7CO', '58e50eee-fb76-4509-bd5e-f500616c0e8a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.163005764289196, 128.23405656001106, '충청북도 제천시 내토로 991-0 (고암동,의료법인명지의료재단명지병원)', '의료법인명지명지병원', ST_GeomFromText('POINT(128.23405656001106 37.163005764289196)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600017', '$2b$04$XRvBEmOLvQJbP5l8/ET1EOBtIiSk1hW4duOEKU41g6cUIYZ/mXQxy', '19373db5-e62d-4212-8119-1b4e9d34cd37', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.8208073192579, 126.421380872161, '전라남도 목포시 영산로 627 (석현동)', '의료법인목포구암목포중앙병원', ST_GeomFromText('POINT(126.421380872161 34.8208073192579)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100022', '$2b$04$Gf1AAedjmxgBbL26SkG.uexAlNjoWDivg2ysTDRe61UaenJm2uKne', '1679228d-d83b-4f3f-854f-a563b7fc4f20', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.99308383421509, 127.08907896026507, '경기도 평택시 평택2로20번길 3 (평택동)', '의료법인박애박애병원', ST_GeomFromText('POINT(127.08907896026507 36.99308383421509)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100028', '$2b$04$z8Xgq3cqtaPJ6d6CvxrJBuJn/XlcN1lbsP07eHfIfqDJsT02P2FP2', 'a319d80c-8fe4-4ef0-8c67-5b121b2f8a80', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.9905734199, 127.120463688, '경기도 평택시 중앙로 338 (합정동)', '의료법인백송굿모닝병원', ST_GeomFromText('POINT(127.120463688 36.9905734199)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400009', '$2b$04$Yn9VdlnSGLJqxt3CrUAZ6uzq2JkOcvKtMEIf3CtUQzJAUGLMNYB8u', '189a7891-c1ac-418e-97ba-2faf6f9cc354', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.19250243074026, 127.09436976296006, '충청남도 논산시 시민로294번길 14 (취암동)', '의료법인백제병원', ST_GeomFromText('POINT(127.09436976296006 36.19250243074026)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300033', '$2b$04$hRBXIWnT5YpUDA/AhkepAOtsqUpZHkdt6tD34.ACxU81qInBurnR2', 'b7ab8ed8-156d-4551-8207-2b2b41fb390c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.86845464452633, 128.61518371219722, '대구광역시 동구 국채보상로 769 (신천동)', '의료법인백천바로본병원', ST_GeomFromText('POINT(128.61518371219722 35.86845464452633)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200046', '$2b$04$5J2alhmnm5BJhRd/X16pnunLqaiC2mWSbRPh3IWnrIXyi6f67z2lK', '46625439-6e0b-4f4e-b560-494069d60538', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 38.198021245336555, 128.57838660480326, '강원특별자치도 속초시 중앙로 11 (교동)', '의료법인보광속초보광병원', ST_GeomFromText('POINT(128.57838660480326 38.198021245336555)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700009', '$2b$04$n/Gr8pRXf8.1kMWKfB3b2emzPa95rAD1lP8YjDsrRp.T4BD/p5s4S', 'cfa3c0c5-ab43-4401-a447-9b01050ca4a1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.42029125774357, 128.15973341130405, '경상북도 상주시 냉림서성길 7 (냉림동)', '의료법인삼백상주성모병원', ST_GeomFromText('POINT(128.15973341130405 36.42029125774357)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600066', '$2b$04$nw.Y7uedIMafkWw/XVHpLevtM7jxrQsVawSaB2iby74YJNDbT7Y5W', 'd9a091de-bd43-4166-8d06-4bbf8361a423', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.833846754024535, 127.34573228719377, '전라남도 보성군 벌교읍 남하로 12', '의료법인삼호벌교삼호병원', ST_GeomFromText('POINT(127.34573228719377 34.833846754024535)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700036', '$2b$04$iicq2ErHXOmXJnHM/gjKzO5WOH7Uo/RaOSTSi4rRu3wgWsbuVT41G', '51f8c969-99b3-40f8-869e-f97c6aa246ee', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.82621911080917, 128.7374074375532, '경상북도 경산시 경안로 208 (중방동)', '의료법인서명세명종합병원', ST_GeomFromText('POINT(128.7374074375532 35.82621911080917)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100041', '$2b$04$choU/qS/rEdaO5OzaDj9fetxcGUWIO0LlHGmljemxdQD1uwjio9j6', 'a132ab01-877c-4b51-8d06-463a0a670f31', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.48427507045319, 126.93253922577287, '서울특별시 관악구 남부순환로 1636, 양지병원 (신림동)', '의료법인서울효천에이치플러스양지병원', ST_GeomFromText('POINT(126.93253922577287 37.48427507045319)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700023', '$2b$04$Fku/WxnF.UDJWK6lPG7S0.KDAcJfE9rjP5F9bIUY2fIlDOzBDqmaO', 'fefa42af-a866-495c-a6dd-605399e14d45', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.65741644988633, 128.45890491333589, '경상북도 예천군 예천읍 시장로 136', '의료법인서준예천권병원', ST_GeomFromText('POINT(128.45890491333589 36.65741644988633)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400044', '$2b$04$1u73MjaGJ1RS4FOIz5tLw.h1wa8KVFdOS7QGaYCaoYFq3291HLkTi', '17b686aa-d362-4c2e-9840-ef744efd7461', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.08449428686221, 126.6875810614244, '충청남도 서천군 서천읍 서천로 184', '의료법인서해병원', ST_GeomFromText('POINT(126.6875810614244 36.08449428686221)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100027', '$2b$04$9Mvhq15JqVRYiCkvDZw1y.5khMwXkJ.vlEb0PmFShpNCGTSCrvLXu', '112df6f3-65df-41e2-a8c1-09d8bcc21211', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.336409472880064, 126.72768862827667, '경기도 시흥시 공단1대로 237 (정왕동, 센트럴 병원)', '의료법인석경센트럴병원', ST_GeomFromText('POINT(126.72768862827667 37.336409472880064)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800018', '$2b$04$3mQZS7EdviXlTRPpLphTsepIlyCUDT9YiryLn6xHOLWRsYge5PRd2', '34057e67-df78-4275-a4b7-0259db290390', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.199036071110854, 128.56772923734115, '경상남도 창원시 마산합포구 3·15대로 238 (중앙동3가)', '의료법인석영창원제일종합병원', ST_GeomFromText('POINT(128.56772923734115 35.199036071110854)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500009', '$2b$04$psf5jyzXdXu8JUaITenxbe75kA.8UOuFvlgDfK4gPuE8fQ6D79eia', 'caaa7cde-be79-469c-92bf-ef3d00748862', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.43645131091079, 126.69331814963527, '전북특별자치도 고창군 고창읍 화신1길 9', '의료법인석천재단고창병원', ST_GeomFromText('POINT(126.69331814963527 35.43645131091079)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2116972', '$2b$04$q7kG/9Wf2zkvNqb7NFJpO.HBKw4k18eR6hnXQiiM2GO08RnhRLtju', '211f8fca-87a7-4efa-af3b-8dcc192d3b4a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.65413326289407, 126.77574306091104, '경기도 고양시 일산동구 중앙로 1205, 지하1층(일부),지하2층,지하4층(일부),1층(일부),2층(일부),3층(일부),4~5층,6층(일부), 7~10층 (장항동)', '의료법인성광일산차병원', ST_GeomFromText('POINT(126.77574306091104 37.65413326289407)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200037', '$2b$04$pku/xZNUzlLOF.UzeIdXZ.f7t5eqDaPbpqoNook/UdqKmhjNDeMN6', '9c530950-ccc1-4e11-ba67-487ea4815f8d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 38.1047788862656, 127.99119726275, '강원특별자치도 양구군 양구읍 중심로 160', '의료법인성심양구성심병원', ST_GeomFromText('POINT(127.99119726275 38.1047788862656)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200024', '$2b$04$hd6A7uBFYM9L4nEPvGAQSeQNJtUYXuo/cY/xbUxkr93mLfSsYHKnq', 'dce52461-baff-485c-8ab6-7a90ccbed979', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.3452989790958, 127.954009227598, '강원특별자치도 원주시 원일로 22 (인동)', '의료법인성지성지병원', ST_GeomFromText('POINT(127.954009227598 37.3452989790958)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100030', '$2b$04$xvAq8CSCMAEA513ZdnpR3ejzQZU9iuYX08jMLeAkrtPLqwFXi/Ug.', '363a73dc-dad5-4cba-b040-227c699f2989', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.63547043209498, 127.02267251878474, '서울특별시 강북구 도봉로 301 (수유동, 대한병원)', '의료법인성화대한병원', ST_GeomFromText('POINT(127.02267251878474 37.63547043209498)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200101', '$2b$04$pa2P1M4NX0MmkYZgZSUPdOR2EPL6QNY7i309vePU6jRicE34QlfcC', '79b57680-4bee-40fa-972b-1f4a39078d70', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.1611949258804, 128.98454762202408, '부산광역시 사상구 새벽로 226 (괘법동)', '의료법인센텀 서부산센텀병원', ST_GeomFromText('POINT(128.98454762202408 35.1611949258804)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300039', '$2b$04$v5KlzOs8flI1GxQRtV4QgeJYMabYUd3cijPFb9QHOsWxlROtWmKBK', '3f4303e0-bd86-4b9e-a410-0e440c8ec2cb', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.63402150390528, 127.45009452402523, '충청북도 청주시 흥덕구 사직대로 26 (복대동)', '의료법인송암마이크로병원', ST_GeomFromText('POINT(127.45009452402523 36.63402150390528)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700025', '$2b$04$KNPvDUVQV5h9K66zBRG/y.0TJYaZheNXqK.uSSKfnBHBHScpSk7B6', '657ee766-e01b-4729-ba53-c152199dbeb0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.58285370330335, 129.35905740278506, '울산광역시 북구 산업로 1007 (연암동)', '의료법인송은울산시티병원', ST_GeomFromText('POINT(129.35905740278506 35.58285370330335)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800006', '$2b$04$I3wRheusZHsMGJ1vjDHGieNwV.Ek4wY5L/UFWNJcmcHFj1tNZkUk2', '5b03dc0f-c88f-4f36-aea2-4b8fa322c22e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.2304897832, 128.8935457971, '경상남도 김해시 활천로 33 (삼정동)', '의료법인숭인 김해복음병원', ST_GeomFromText('POINT(128.8935457971 35.2304897832)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800068', '$2b$04$6yi3W/Osrn5k0rQ3WT/U4.BPxbCSTVXRKyWbohTmDu777/J6Cw7n2', '535844d7-385a-4414-97ca-c8109201e0c5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.93302179207928, 128.08012015415227, '경상남도 사천시 남일로 33 (동금동)', '의료법인승연 삼천포서울병원', ST_GeomFromText('POINT(128.08012015415227 34.93302179207928)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600051', '$2b$04$QmS1IaJiP.OXHS8b9epKDuysiNTMCchWzLxBy5j1.7a.weaPADMoC', '0dc22f1e-da7c-474a-8d6f-ef2203e9c72d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.722263099542104, 125.93256566497465, '전라남도 신안군 비금면 송치길 155-11', '의료법인신안대우병원', ST_GeomFromText('POINT(125.93256566497465 34.722263099542104)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800146', '$2b$04$/54potFABwcUuYzNJtIMhONXQnfn.5jpWEbSX3l43LadxLyoj7aRq', 'a2d6a1a6-f763-44d2-a150-ddcf9ebb3107', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.226730571, 128.8821901808, '경상남도 김해시 김해대로 2335 (부원동)', '의료법인신김해삼승병원', ST_GeomFromText('POINT(128.8821901808 35.226730571)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700014', '$2b$04$OzIyq6zKWNn8NnC7nsd4Z.FkolUP8idLREV7BSMrksKgjUBUcNDMm', 'ab2bc82a-cb9a-463f-9c95-d15082a33b4b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.54691448006022, 128.70097021920307, '경상북도 안동시 앙실로 11 (수상동)', '의료법인안동병원', ST_GeomFromText('POINT(128.70097021920307 36.54691448006022)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2113246', '$2b$04$7D7RBl7wDgiMxe.0S8bSKOLo8GroeuB8.uUfvcqcq7NVpjoqHpWcm', '0f6433fc-1f9e-49dc-a8fa-5d350873d9ad', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.008809910565546, 127.07371568769604, '경기도 평택시 평택로 284 (세교동)', '의료법인양진평택성모병원', ST_GeomFromText('POINT(127.07371568769604 37.008809910565546)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700036', '$2b$04$spvGFm3vs76c7F8uNXdJ6Ov9H2GZ7OInM4uBJaHc6RMjm/6fmTd/W', '2cac2a44-5fca-4cbf-b3ef-b4eb30e485b0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.556584160908145, 129.33096884743864, '울산광역시 중구 학성로 184 (학성동)', '의료법인에스엠씨울산세민병원', ST_GeomFromText('POINT(129.33096884743864 35.556584160908145)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500005', '$2b$04$k5Qr0FitG1ccwa5/P13os.95iHv.tApksjReNx34UNVPrgJIyIcfu', '9e78e04b-d50e-46d6-a8c3-0da5cd3d6751', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.81502660230338, 127.1247991889436, '전북특별자치도 전주시 완산구 한두평3길 13 (중화산동2가, 전주병원)', '의료법인영경전주병원', ST_GeomFromText('POINT(127.1247991889436 35.81502660230338)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2501890', '$2b$04$NkRMHUFzQGHoSilqL9ZNh.PlK6Z1WpZ0.s.9utrv.Je07JacgNEbO', '88d04824-316c-4106-9059-dc6737f46b91', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.865528416459995, 127.14790290638277, '전북특별자치도 전주시 덕진구 동부대로 895 (호성동1가)', '의료법인영경호성전주병원', ST_GeomFromText('POINT(127.14790290638277 35.865528416459995)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100034', '$2b$04$GZ.JJRpevcrYSIdgSD5AoOQSlDrXrABYUL7.vdCDKfdcP.BL4.LMu', '9b6313cd-e153-4442-8f7e-0ed1914ee678', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.74536735722315, 127.06206709820381, '경기도 의정부시 금신로 322 (신곡동)', '의료법인영동의정부백병원', ST_GeomFromText('POINT(127.06206709820381 37.74536735722315)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400012', '$2b$04$2CD0t1SUcvqd4wxNLbrHueKgXEcuyUUJNNUOpXBlVHkJ/p4k8Ze4K', '2d8ae848-6437-492b-8e8d-75d15199a942', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.79739687904163, 127.13157820432319, '충청남도 천안시 서북구 다가말3길 8, 충무병원 (쌍용동)', '의료법인영서천안충무병원', ST_GeomFromText('POINT(127.13157820432319 36.79739687904163)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600018', '$2b$04$ikpR29qzbVlL9wPMpNzDF.P/SuwNiGttv/t5m5ky/nvUZNxBy/Ou.', '9774fe37-ff18-49a0-873e-00cd7ec0a8a6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.620393082853, 127.293713733344, '전라남도 고흥군 고흥읍 고흥로 1935', '의료법인영성고흥종합병원', ST_GeomFromText('POINT(127.293713733344 34.620393082853)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700070', '$2b$04$XfzFAasS98SVdTX1TQXmEOm8J2vA/KcBAAg/OLXdUz9piFy9xl7Te', '7ba1b754-145a-457e-a931-688f118719f0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.72995531573922, 128.27201138885076, '경상북도 고령군 대가야읍 중앙로 33 (영생병원)', '의료법인영암고령영생병원', ST_GeomFromText('POINT(128.27201138885076 35.72995531573922)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700063', '$2b$04$BnngglT.AV5zFmlKi1Qlvuw3Vvy13cOpZvjpdXEro7So1yFv6OFIC', '35194930-59c9-41e2-824d-d05d50862e1f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.38925516777733, 128.43429486266444, '경상북도 의성군 안계면 용기4길 36', '의료법인영제영남제일병원', ST_GeomFromText('POINT(128.43429486266444 36.38925516777733)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600008', '$2b$04$EpFnoDadbL8hkih2Bmc2fORHRI7JTLdKgTRlx6kh9os0uY4Wv3xXi', '30f78e26-0f0d-4712-93ed-1ba0bbd71143', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.3359621088938, 127.41011056508802, '대전광역시 중구 목중로 29 (목동, 선병원)', '의료법인영훈대전선병원', ST_GeomFromText('POINT(127.41011056508802 36.3359621088938)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600007', '$2b$04$RMTyyCl3BBK9TAQVcRRiOen7g7dzh3DB4QilWL2ehU69k6eciYY4i', 'd9baba73-8d95-422f-bbd2-d0e4eec32b92', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.37535496572087, 127.32491359339663, '대전광역시 유성구 북유성대로 93 (지족동)', '의료법인영훈유성선병원', ST_GeomFromText('POINT(127.32491359339663 36.37535496572087)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400004', '$2b$04$z4jOvlSvj2VVdJe0PNx1aeU4T3gFfp4zy3FkiAoeROBLYtxGrUTga', '3ab6aeef-acd2-40ee-821d-224ec5f87396', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.69111403683895, 126.83810397105952, '충청남도 예산군 예산읍 금오대로 94', '의료법인예당예산종합병원', ST_GeomFromText('POINT(126.83810397105952 36.69111403683895)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500012', '$2b$04$AVzPlJAAKXKsd.NB8Mksnu4Mc0HzrusscP9LzNSxN2bgAPkIC.wlC', 'af0d20a0-350c-44eb-8bb8-29b4b14abd1a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.97740074466571, 126.73719225835914, '전북특별자치도 군산시 조촌로 149 (조촌동)', '의료법인오성동군산병원', ST_GeomFromText('POINT(126.73719225835914 35.97740074466571)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700066', '$2b$04$QaV/cxvb2.xpOmBnfZjvLeF3pkpWqkTSooO2N87GXA1rSuNHbB8re', '3677848b-72ec-4ab6-84a4-e9250c1a1871', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.99606388888889, 128.4015222222222, '경상북도 칠곡군 왜관읍 군청2길 10', '의료법인왜관병원', ST_GeomFromText('POINT(128.4015222222222 35.99606388888889)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100053', '$2b$04$BhrC.VAyq9P.zgUHc.CrnOWE0VB6tf6vBd2L/Db5YbJlf7JccINoC', '8310e3bc-5b1c-4257-a238-8d5c33b6e35a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.632530143647166, 126.7105272263707, '경기도 김포시 감암로 11, 김포우리병원 (걸포동)', '의료법인우리김포우리병원', ST_GeomFromText('POINT(126.7105272263707 37.632530143647166)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600021', '$2b$04$2jmsL/wnYeB5oOsmj8CyTunfxuuAQyc1..Oqz3lRWYwiRxTtM3db2', '615c3816-bec0-48e1-b2f5-c5143f8d345a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.67726071666993, 126.91093606650924, '전라남도 장흥군 장흥읍 흥성로 74', '의료법인우범장흥종합병원', ST_GeomFromText('POINT(126.91093606650924 34.67726071666993)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2115699', '$2b$04$CM6qQhdlHlmCvqxv4Rnf2ux6ax5Rq.Wokldw6d4eSHCDnDdlNhx06', 'f900f1f6-4c64-41c7-aedb-0136134b44c6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.2100621333, 127.0080345889, '경기도 화성시 화산북로 21 (송산동)', '의료법인원광원광종합병원', ST_GeomFromText('POINT(127.0080345889 37.2100621333)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200005', '$2b$04$ktQHn0SiK5iLyWR1mnfczOqDBC6S9erZTRVuXoW6zSX24uaMalCtq', 'a72bf361-ac03-4312-b3d1-5c81f9372fb7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.1505677387241, 129.0081978825217, '부산광역시 사상구 가야대로 326, 좋은삼선병원 (주례동)', '의료법인은성좋은삼선병원', ST_GeomFromText('POINT(129.0081978825217 35.1505677387241)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2702563', '$2b$04$UNvUDLgzs774T7pM1JpId.SYa5.M.fjdNMfvX9cyRORj2TNrATQO6', 'bee7c00a-265b-4ced-810a-ba6fdc3d62ca', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.048089061494764, 129.36704339734024, '경상북도 포항시 북구 대신로 43 (대신동)', '의료법인은성좋은선린병원', ST_GeomFromText('POINT(129.36704339734024 36.048089061494764)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100018', '$2b$04$2SfgCvO791LzfOJ3quXgbuSK8ON6.2C8MbgprfCpv3ftyWRQuzEQy', '1796a8ea-70c4-42b8-89d0-3ed504c85c59', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.13118966594901, 126.910365631779, '경기도 화성시 향남읍 발안로 5', '의료법인은혜와감사화성중앙종합병원', ST_GeomFromText('POINT(126.910365631779 37.13118966594901)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100006', '$2b$04$MEkRbixH7njkzkV3g8m5wevNx/NMbopLSWfP0fOb7cwPZICWXSypu', 'cef4e743-3ae0-46a1-81c2-485fa2512d27', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.64095507933562, 126.66022763544733, '경기도 김포시 김포한강3로 283, 뉴고려병원 (장기동)', '의료법인인봉뉴고려병원', ST_GeomFromText('POINT(126.66022763544733 37.64095507933562)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100255', '$2b$04$OUVyFkUlVAREk.FNjawYv./QxlTbofFR3NXFCV2RNGjCYk008qNzK', 'b6884d28-afe7-4b94-9a84-e45cec08b450', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.526858089517, 126.89561402986, '서울특별시 영등포구 당산로31길 10 (당산동3가)', '의료법인인봉영등포병원', ST_GeomFromText('POINT(126.89561402986 37.526858089517)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400014', '$2b$04$smNrPLSUUlvljYiL6FzRPu.rRjbc5ODD5bFF8rq/EdlLpTQISwKum', 'c3310e36-d890-4d60-8434-d22299f0064a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.53218449100167, 126.73435495537973, '인천광역시 계양구 장제로 722 (작전동)', '의료법인인성한림병원', ST_GeomFromText('POINT(126.73435495537973 37.53218449100167)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600090', '$2b$04$yMBHuv8Kc4UjukmIYAqKZOfSJa3I8txToej5pcOChKfQCXAWa82uq', 'e174b897-cdf9-4730-b7ec-32f930f4158f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.061886111111114, 126.51980555555555, '전라남도 함평군 함평읍 영수길 132, 함평성심병원', '의료법인인성함평성심병원', ST_GeomFromText('POINT(126.51980555555555 35.061886111111114)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300007', '$2b$04$rbpUZ5lZ1wQ1CIhX6IUQdOb0a.Wtdi/IFnEj03N1N387CT.7v.C76', '50ddd548-757d-4984-898c-689e142e2a52', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.61950588971749, 127.49659485930336, '충청북도 청주시 상당구 단재로 106 (영운동)', '의료법인인화재단한국병원', ST_GeomFromText('POINT(127.49659485930336 36.61950588971749)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100283', '$2b$04$Q1p73d7jcDxO1MNR5mjAEeHIdxD7F88UX05e8M.ERaosAow9v691i', 'c4b2c615-1d94-470f-8438-60fe4db38a63', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.68205457051212, 126.7801254241406, '경기도 고양시 일산동구 고양대로 760, 가동 (중산동, 일산복음병원)', '의료법인일산복음병원', ST_GeomFromText('POINT(126.7801254241406 37.68205457051212)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300005', '$2b$04$s0S8vSIkHt.X5NsnDOKl2esTLeuKwuhPKRY4X2JdyvnkN1hj/zQqC', '05550216-dde9-40a9-a39b-30427d957a2e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.13857101389598, 128.20613928597677, '충청북도 제천시 숭문로 57 (서부동)', '의료법인자산제천서울병원', ST_GeomFromText('POINT(128.20613928597677 37.13857101389598)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100290', '$2b$04$n3hyLcuXUIvaWxpdcfXYMOXyvQZ9gRxVnoIqeHfKFXxGp.7MsA6Za', '9220b550-4305-4565-b421-39f069bf68a0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.62297864974611, 126.83568238933726, '경기도 고양시 덕양구 중앙로 555, /중앙로557번길 14, 지하1(일부),1-6층 (행신동)', '의료법인자인(더자인병원)', ST_GeomFromText('POINT(126.83568238933726 37.62297864974611)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600068', '$2b$04$W3nX3MyboTiMH4UyEE93U.lFf1PcmQuZw1JUBgkNLEVcDHEfdYvfy', '3c1b8b1f-3437-4e71-ba9c-8e2fe1c8a1d8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.5461939078177, 127.14569777683869, '전라남도 고흥군 도양읍 차경구렁목길 215', '의료법인장호녹동현대병원', ST_GeomFromText('POINT(127.14569777683869 34.5461939078177)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300017', '$2b$04$kVB7uQL/Cbq1o3yH08d8f.2KAFxW90GIEkF6eXDppSzbVKGH9gRFq', '912248c4-2fee-46d2-b157-a09a2fd1b1c8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.48327155579628, 127.71821043397682, '충청북도 보은군 보은읍 보은로 102', '의료법인정민보은한양병원', ST_GeomFromText('POINT(127.71821043397682 36.48327155579628)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300003', '$2b$04$i9Qx5nx01pq1gLp7ZFiqueE7GILFqzBGhQ79xhwLuQIKMCqGhkKEK', '0aace442-c850-4d37-b96e-928dfcd03b23', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.624556372628305, 127.49558522201268, '충청북도 청주시 상당구 쇠내로 16 (금천동)', '의료법인정산효성병원', ST_GeomFromText('POINT(127.49558522201268 36.624556372628305)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700028', '$2b$04$uDzPiLRIzk2EwrilpG05Pecx3DXZF13dd6N4E92fotKUL7SBShA9u', '047e849a-a680-43d9-ba8c-7c893a400dbc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.53208761614168, 129.3048401436768, '울산광역시 남구 문수로 472, 중앙병원 (신정동)', '의료법인정안중앙병원', ST_GeomFromText('POINT(129.3048401436768 35.53208761614168)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200017', '$2b$04$fhqwrVnh6YVP3aSzCpb9pOvHvFCNtuXUhgoYYduXjxUydILVEJTr2', 'ac13f9fa-46c5-444a-b1f2-c23858a20288', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.13085783627095, 129.0505708823645, '부산광역시 동구 중앙대로 401 (좌천동, 봉생병원)', '의료법인정화 봉생기념병원', ST_GeomFromText('POINT(129.0505708823645 35.13085783627095)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300030', '$2b$04$obJU7JOMigMqnenVvBg/zeYOn7F2O617lYDw.0N9aQlXzYkPncdZu', '010f5524-521d-4657-b1b9-4f3fad541041', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.1852328446, 127.7808325647, '충청북도 영동군 영동읍 대학로 106', '의료법인조윤영동병원', ST_GeomFromText('POINT(127.7808325647 36.1852328446)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2900006', '$2b$04$nfw91l0LTgEv6Ye9H71Gyuc5u/TbABrVDGXbUyYcts0.zFb4S3YEG', '7cf9ffa0-b0ce-4c7c-ab9d-8007904ac9d5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 33.492346148279836, 126.47058708143307, '제주특별자치도 제주시 월랑로 91-0 (이호이동,중앙병원)', '의료법인중앙중앙병원', ST_GeomFromText('POINT(126.47058708143307 33.492346148279836)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100023', '$2b$04$fJgroIGJuJKE/Eumd012NeIHMBVO0qXdWVEhSvvpkJ9ItBhdXatXK', 'e83b4515-6f87-4860-bc51-22b7d21795e8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.62079154435882, 126.91955399169245, '서울특별시 은평구 통일로 873 (갈현동)', '의료법인청구성심병원', ST_GeomFromText('POINT(126.91955399169245 37.62079154435882)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800009', '$2b$04$AwVttrYnWYF4bxaoy/c24eYj87lxCjWshxpBu9o..9bStQfzthlPC', '26e0a663-72c2-4cb6-81c4-2feaa08e60dc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.24798366104159, 128.50971731844322, '경상남도 창원시 마산회원구 내서읍 광려천서로 67 (청아병원)', '의료법인청아청아병원', ST_GeomFromText('POINT(128.50971731844322 35.24798366104159)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100301', '$2b$04$REUo/EnLxrYp5M14Mn0Lju5GPvSjRhyDlDRNsG1AuULYUgC3h6beK', '2867fea1-d949-414f-9c5c-2a2cc0a92aca', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.0885408447458, 127.0641653404409, '경기도 평택시 오좌동길 17-16 (독곡동)', '의료법인청파송탄중앙병원', ST_GeomFromText('POINT(127.0641653404409 37.0885408447458)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100124', '$2b$04$tjmjLd3Unahh1MxcqdpRc.dfP8cpHlzqcVnS5HiCKkMtCIxJuG5bK', 'd4c87a8a-a363-442e-8601-1a36d42a84fc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.327020396286656, 126.84486352776976, '경기도 안산시 상록구 예술광장로 69, 사랑의병원(593-4번지/593-5번지) (성포동)', '의료법인칠석사랑의병원', ST_GeomFromText('POINT(126.84486352776976 37.327020396286656)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300015', '$2b$04$0VdK9zcxevFZrSNY8l5W2evx1X2FxKSWpleZI.YUr5MmvX6gXYPvy', 'db55cbbc-81f6-4da7-9a8b-0e5c26b4c85e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.99760379156879, 127.59853452216106, '충청북도 음성군 금왕읍 음성로1230번길 10', '의료법인태성제일조은병원', ST_GeomFromText('POINT(127.59853452216106 36.99760379156879)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100175', '$2b$04$sUiouBcaX/Mt2/y32w/vFOUFYcOPWB5DLCA3xHmkIhIo8.fmDR9Ne', '49e78c25-00e8-4ff8-84f9-5ccf311ae976', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.26502978126203, 127.0254583588438, '경기도 수원시 팔달구 경수대로 437 (인계동)', '의료법인토마스윌스기념병원', ST_GeomFromText('POINT(127.0254583588438 37.26502978126203)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100075', '$2b$04$Tibl3tn8udyfJoA.tloHKe6h0w3AC183hTMS5ypRN9L8WsPNlgUfi', '5c9eea13-d09f-4139-a60a-3a841500ffe0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.60067564592665, 127.1090292210168, '서울특별시 중랑구 망우로 511, 동부제일병원 지하1~6층 (망우동)', '의료법인풍산동부제일병원', ST_GeomFromText('POINT(127.1090292210168 37.60067564592665)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100021', '$2b$04$qx2/Mrv7WzDGLZBlVR1InedyzcGNAVhv8LWIL8AforcbNkXFl5a/O', '4e465c5d-eaf8-4d6b-83f4-b19f7c4c2410', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.3002188172703, 126.81357021652913, '경기도 안산시 단원구 원포공원1로 20, 동의성단원병원 (초지동)', '의료법인플러스단원병원', ST_GeomFromText('POINT(126.81357021652913 37.3002188172703)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600005', '$2b$04$SK57Fw4pm4v7TMHsqFIo8ecQ0cvpps4WESzd1pS6xJtQe2rgM/r2a', '00cc7ce7-71df-4336-9cb7-857a8320127b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.947741459842966, 127.51235838977138, '전라남도 순천시 우명길 42 (연향동)', '의료법인한국한국병원', ST_GeomFromText('POINT(127.51235838977138 34.947741459842966)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600027', '$2b$04$YDVQP0tz.E1sRzg7tu1CXuXL/WijSK3Dl9TTMaFTJFEYy3KRNHvSS', '3b436b95-657b-4e5e-a89e-92e0730bfbd0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.766166666666656, 127.66355833333331, '전라남도 여수시 쌍봉로 70 (학동, (학동))', '의료법인한마음여수제일병원', ST_GeomFromText('POINT(127.66355833333331 34.766166666666656)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300002', '$2b$04$fD1fVVn6U2VGdVPoRvCI/e5oSz2zOQuUVRUBYNnRxLBmmkERpjjwS', '8e08b80a-badc-4def-9961-d2e8b52a928b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.623474045244464, 127.43081864239413, '충청북도 청주시 흥덕구 2순환로 1262 (가경동)', '의료법인한마음하나병원', ST_GeomFromText('POINT(127.43081864239413 36.623474045244464)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100020', '$2b$04$kYVskT6hgxeIUDcdBx15hub1Yf/8aLFr8atOr5KMUxDk36wCp.Giy', '7283be6a-d1a9-43f6-9570-7827a8508584', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.64611570419094, 127.02902417950423, '서울특별시 도봉구 우이천로 308, 한일병원 (쌍문동)', '의료법인한전한일병원', ST_GeomFromText('POINT(127.02902417950423 37.64611570419094)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800017', '$2b$04$4lsnPR5R7r8vlNZUcb2h9.Wrvjde6Wm1TLLoYZoUGUQQC2llA0eKm', 'fd22cdce-1107-4643-8bc4-52e7295a4619', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.18635329986849, 128.56163160027907, '경상남도 창원시 마산합포구 3·15대로 76 (월남동2가, 합포의료재단)', '의료법인합포에스엠지연세병원', ST_GeomFromText('POINT(128.56163160027907 35.18635329986849)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600007', '$2b$04$hlODcx5QXyY11UclhrJ07uv7wsF/mgK1DsgYTlWmtHGD/cBTBzw8W', 'c24e5a4f-a0b4-47d4-8b90-d370c7cbe302', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.817030098221025, 126.38033941552499, '전남 목포시 고하대로 795-2   (연산동)', '의료법인해민 세안종합병원', ST_GeomFromText('POINT(126.38033941552499 34.817030098221025)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600035', '$2b$04$3XU6ReJ.XRIAdSVBIY0Oa.xmWhm/gB8sLswrZfRtbPieCZRuKn1g2', 'd7d56810-25da-40fd-8adf-6a31c4b48735', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.305871659607845, 126.78361958777766, '전라남도 장성군 장성읍 역전로 171', '의료법인행복나눔장성병원', ST_GeomFromText('POINT(126.78361958777766 35.305871659607845)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600009', '$2b$04$ULy3BvehryM580FcGSwM6O06CtAKByNCA6mmf5Nt0N2mUiZSQqNCq', '3c10d486-8080-406c-ae27-467ba30cbc7a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.571547222222215, 126.61268333333334, '전라남도 해남군 해남읍 해남로 45', '의료법인행촌 해남종합병원', ST_GeomFromText('POINT(126.61268333333334 34.571547222222215)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600024', '$2b$04$Pb1hBc7geUHLOr5Om3MEdO7ZQBxBSEh3PX3YKUNh/eslobWqqJYna', 'c9303ea9-fed9-4e0e-8b0c-feddd4f939cc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.957912006875524, 127.69055714590516, '전라남도 광양시 진등길 93 (마동)', '의료법인현경광양서울병원', ST_GeomFromText('POINT(127.69055714590516 34.957912006875524)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800010', '$2b$04$mvb9lvs60yU4zGEkmArFjOyYSzuBhqmlpY92EhYq5YKhs1T2P18dm', 'aec3935e-b8c0-4e25-ba53-7731cb1a9b92', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.2623038386, 128.8615781975, '경상남도 김해시 김해대로 1814-37 (삼계동)', '의료법인환명 조은금강병원', ST_GeomFromText('POINT(128.8615781975 35.2623038386)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300011', '$2b$04$oqbqR.eqxWBH73UA/cCR7eXhWspsvRhrG0sYF.En3P15X9yqAiRt2', 'c21feab0-a3c0-4abc-b8ba-fa142d40478a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.313345842294304, 127.57197742757523, '충청북도 옥천군 옥천읍 성왕로 1195', '의료법인힐링옥천성모병원', ST_GeomFromText('POINT(127.57197742757523 36.313345842294304)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200010', '$2b$04$gZfEpmzIZmWNkjIQFP8OLexrYzwpIFwwHZFBK9JrrNRTBXwJ3zIAu', '395a26fb-fbb2-4479-8e9b-6d150a291f7a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.75910092005996, 128.89982468955142, '강원특별자치도 강릉시 옥가로 30 (옥천동)', '의산강릉고려병원', ST_GeomFromText('POINT(128.89982468955142 37.75910092005996)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100005', '$2b$04$uLEz585aFpTTeRsRJjV2OOb3IWQq2RaQsnVyP8hAwdAUVChBwSnJe', '3cba162a-72ef-437e-8b7e-bc983149743f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.53654282637804, 126.8862159683056, '서울특별시 양천구 안양천로 1071 (목동)', '이화여자대학교의과대학부속목동병원', ST_GeomFromText('POINT(126.8862159683056 37.53654282637804)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1120796', '$2b$04$9PYSEoC9ExmWli4bpqm4Z.MxzU3CsDgTNMZIAL.FzXaHVX/lpjtPK', 'bcb8ef2b-c0bf-4c2b-9b87-ab6eec9aa8ad', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.557261149, 126.8362659275, '서울특별시 강서구 공항대로 260, 이화의대부속서울병원 (마곡동)', '이화여자대학교의과대학부속서울병원', ST_GeomFromText('POINT(126.8362659275 37.557261149)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100010', '$2b$04$RXCoOtTvx3.kmOY2OJOSE.y58Tl.2uf91zY7imKyNgrwl0UJGAXLC', '3d0e3669-70a9-4bfc-b91d-01406ce40685', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.378597979767605, 126.93529986382785, '경기도 안양시 만안구 명학로33번길 8 (안양동, 메트로병원)', '인산메트로병원', ST_GeomFromText('POINT(126.93529986382785 37.378597979767605)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200033', '$2b$04$mJJ5T/AnRFxSdLMO92GDeuAThDJ6FdCNnXAS5X8nTlz6Vtgfkgs7a', '4b4ad24e-ea42-4991-8965-e0bcb6c40fe1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.88124367430593, 127.7268803699377, '강원특별자치도 춘천시 금강로 39 (낙원동)', '인성병원', ST_GeomFromText('POINT(127.7268803699377 37.88124367430593)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200022', '$2b$04$DhFRg0ui7B/MllcIRUR0eeANdmd3Yqm8VuUWYI5GMApfARVbVncxO', '4e574ae2-fe53-469b-93e3-0a63c9548b25', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.17334313589264, 129.182181239924, '부산광역시 해운대구 해운대로 875 (좌동)', '인제대학교 해운대백병원', ST_GeomFromText('POINT(129.182181239924 35.17334313589264)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200001', '$2b$04$imJLFDzv1zMOU8ikQjfxhOUNwFfaQicRM5dlKaCfqzbbSloeetHaO', '03a273d5-05de-4cf6-8e07-49a096a2ac10', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.146454469689104, 129.02057150748323, '부산광역시 부산진구 복지로 75, 진사로83번길 81, 1층(일부), 3층 (개금동)', '인제대학교부산백병원', ST_GeomFromText('POINT(129.02057150748323 35.146454469689104)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100016', '$2b$04$ybwZJdQA9uad1UYk0oWire/B8FWxhAgV11QaVLG/A4cDQXdamW.mG', '60ff6e41-7c5d-4169-90e7-596bee502c66', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.6485812672986, 127.06311619032103, '서울특별시 노원구 동일로 1342, 상계백병원 (상계동)', '인제대학교상계백병원', ST_GeomFromText('POINT(127.06311619032103 37.6485812672986)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100038', '$2b$04$iTjkP94Znl5E.UmO2DE1G.yhHF6wslkTWIZdrNtCVyvH.PcYpmUG2', '5cb40730-c151-42d9-8000-322e20cc65f2', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.67436543525074, 126.75031388046008, '경기도 고양시 일산서구 주화로 170 (대화동)', '인제대학교일산백병원', ST_GeomFromText('POINT(126.75031388046008 37.67436543525074)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400017', '$2b$04$dVPammS2UNrS6ye0cyN21.DNEegZta6f2xq59fQHvENr5647odUZy', '6cca0cab-d31b-49dd-9e29-7dd184253f1e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.47884441174466, 126.66861045817642, '인천광역시 동구 방축로 217 (송림동, 인천광역시 의료원)', '인천광역시의료원', ST_GeomFromText('POINT(126.66861045817642 37.47884441174466)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400037', '$2b$04$Yf8YfzEb1VvThzxHxI47EOhR9U39a/OzJdqYbffaOnOZvm/Uv6eA.', '9f23edb0-dd18-423c-aba8-5a1523d9f4c0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.96801574541532, 124.72111307252132, '인천광역시 옹진군 백령면 백령로 233, 인천광역시의료원 백령병원', '인천광역시의료원백령병원', ST_GeomFromText('POINT(124.72111307252132 37.96801574541532)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400009', '$2b$04$.pii0RgmF2NzMuPyr5gpSOmSBOUlRO41.A6ejXrEwWFV3nFGdVfUe', '06466e4b-dfdf-4bc9-bef6-c127eb7344d0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.47122873588076, 126.63208102847187, '인천광역시 중구 답동로30번길 10 (율목동)', '인천기독병원', ST_GeomFromText('POINT(126.63208102847187 37.47122873588076)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1403121', '$2b$04$YM9EmrAQhJn84SRV2AgZhuZCH0UJYqw36Et1HXYGsBgJzIyvZm3Im', 'ab27e37e-08d7-490d-b040-1f9d6bd36023', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.53499881280362, 126.72225367019578, '인천광역시 계양구 계양대로 123(작전동)', '인천더드림병원', ST_GeomFromText('POINT(126.72225367019578 37.53499881280362)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400016', '$2b$04$fU1Y5CDgmP.XyWgCNDYyP.i0eomJgxYWtFbBbp.1GX89s4Ub7huM6', '162cd8c8-68cc-435d-878d-e97156462497', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4620681991805, 126.680345104401, '인천광역시 미추홀구 미추홀대로 726 (주안동)', '인천사랑병원', ST_GeomFromText('POINT(126.680345104401 37.4620681991805)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1403372', '$2b$04$4t/4wNH0MEcTQsIK0RC0cubKWhlaqI0ZSw/jYTf3aZk6MulKKo/LS', '60048873-5886-40de-bd37-dfd2ec54c7da', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5325382832, 126.7368531237, '인천광역시 계양구 계양문화로 20-  (작전동, (작전동))', '인천세종병원', ST_GeomFromText('POINT(126.7368531237 37.5325382832)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400018', '$2b$04$ZFhAQ3c9Qm.lSw0NrdQiyeJq8ZshPlxL2r79L5NfZ8WuztGACflAi', '761a62e7-8553-42da-aa7f-e26769655e7b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4185669257, 126.6875335314, '인천광역시 연수구 원인재로 263 (연수동, 인천적십자병원)', '인천적십자병원', ST_GeomFromText('POINT(126.6875335314 37.4185669257)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1403871', '$2b$04$FY8jszo3e.yTlGMZ3Pg/Tewf0PEhEnIVav0.4RePQy9kX5FaPgtWm', '446a7b2c-9631-4ac3-8fd5-fcf68f297192', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4010623210136, 126.714686842521, '인천광역시 남동구 논현로 72, 인천힘찬종합병원 (논현동)', '인천힘찬종합병원', ST_GeomFromText('POINT(126.714686842521 37.4010623210136)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400002', '$2b$04$HOgQO/d3xouPcuFDR8pj4.VtE1x5SSlmqb4HDpJJpfOHJWcmI1lqK', '9b7ebb49-6054-46a5-aa44-eb2d4f560737', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4584235016321, 126.631868269228, '인천광역시 중구 인항로 27 (신흥동3가)', '인하대학교의과대학부속병원', ST_GeomFromText('POINT(126.631868269228 37.4584235016321)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2500022', '$2b$04$bBg4KU5p1gcpjsWd3iOpFe97T0fO9LU8kGClAV3P.m7BRAcp6IzNq', 'e3ebd862-1f99-47b7-ade2-44afdc41d36f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.61249558187053, 127.28697578028248, '전북특별자치도 임실군 임실읍 호국로 1680', '임실군보건의료원', ST_GeomFromText('POINT(127.28697578028248 35.61249558187053)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2500020', '$2b$04$IJZzK8mLRaRLYFQrvRxleOwn2.yOibEjQ/82AaLwDQ6ETzAOE24RW', '57acb78e-efd5-4b63-98e1-efb12da43f08', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.654664903392614, 127.52014287444382, '전북특별자치도 장수군 장수읍 장천로 247', '장수군보건의료원', ST_GeomFromText('POINT(127.52014287444382 35.654664903392614)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600037', '$2b$04$zrWABLeN1nsTW.7jSP7UU.i37LGBvH0.Ih/22XchErogRH.0zsdBu', '1fb3a92e-794e-4cbd-b954-cdaa9473dcd0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.67838230801459, 126.91109914454887, '전라남도 장흥군 장흥읍 흥성로 83', '장흥우리병원', ST_GeomFromText('POINT(126.91109914454887 34.67838230801459)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200110', '$2b$04$6Oi3pgvdSDBI1Vhpsl9fxOdGHvqB1WAIGM4tKnljlER3gD82lbSBK', '2ef3acfe-9539-4d37-86ad-db85218e74c9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.235586741528486, 129.00862669149657, '부산광역시 북구 화명대로 1 (화명동)', '재단법인 베스티안재단 베스티안부산병원', ST_GeomFromText('POINT(129.00862669149657 35.235586741528486)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500008', '$2b$04$xImhSoaA6/ypcQavIUr//.Qu55T1/v9ryZXoJpu4B9xYMkIbD4MyC', '30b7989f-ebe6-460a-9672-d4d89753f4f9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.58899495218047, 126.82346011194952, '전북특별자치도 정읍시 충정로 606-22 (용계동)', '재단법인 아산사회복지재단 정읍아산병원', ST_GeomFromText('POINT(126.82346011194952 35.58899495218047)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2302011', '$2b$04$jkY1qg36uTCRESTIyQJO7.Xe/2j4GVfjq3xKeuerwTYs3NEPVVXom', 'ae0979a7-76c9-41cd-9bb9-32b09b12d3dc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.6364279047, 127.3216412104, '충청북도 청주시 흥덕구 오송읍 오송생명1로 191-0', '재단법인베스티안재단베스티안병원', ST_GeomFromText('POINT(127.3216412104 36.6364279047)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1122381', '$2b$04$JiU1D2vBQaLLuhdr9gBDbe2XE3cwfGAauAJEVaX1khr/z4KVftAQC', 'e6ccbe09-63b9-450d-9da3-7493290eb8ac', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5651102845783, 127.028019796271, '서울특별시 성동구 왕십리로 382 (하왕십리동)', '재단법인베스티안재단베스티안서울병원', ST_GeomFromText('POINT(127.028019796271 37.5651102845783)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400011', '$2b$04$PxjWwAmTSDP1z45XiXQgUOGf.sfeibAV1lJEri74Jqq0j4yDYLGXS', 'f7c467d0-b1ba-405d-80ac-0b4613b6b9f7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.38113998244595, 126.62282846665184, '충청남도 보령시 죽성로 136 (죽정동)', '재단법인아산사회복지재단보령아산병원', ST_GeomFromText('POINT(126.62282846665184 36.38113998244595)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100009', '$2b$04$uardy2qbRg2FREifLD0Y.edt4uiKTJzNBax43A0BcVyKL1NZUqCSq', '5c7d95bb-87b1-4bb8-a186-89fc4ad0a93b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.526563966361216, 127.10823825113607, '서울특별시 송파구 올림픽로43길 88, 서울아산병원 (풍납동)', '재단법인아산사회복지재단서울아산병원', ST_GeomFromText('POINT(127.10823825113607 37.526563966361216)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500006', '$2b$04$5K9y.chYASPGV2sN1I9ZT.9iOKlQlDCQvEYTtSJXcWKRpz0mjLxQW', '8426ba5a-07ca-42fb-b5fe-ebb530553930', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.81440117465108, 127.13325187439274, '전북특별자치도 전주시 완산구 서원로 365 (중화산동1가, 예수병원)', '재단법인예수병원유지재단예수병원', ST_GeomFromText('POINT(127.13325187439274 35.81440117465108)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200027', '$2b$04$C6dWnCmMt55Fi3UcAUkCwOoPAmmN96Kk4PjFqhaTFoHNds.0L6K16', '748e11c0-571f-41ee-91b7-b9e9ee35b01f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.13550455261155, 129.0545970475024, '부산광역시 동구 정공단로 27 (좌천동)', '재단법인일신기독교선교회 일신기독병원', ST_GeomFromText('POINT(129.0545970475024 35.13550455261155)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200023', '$2b$04$.b4w/37jOIT2/D7IuNWuwOgT/XQsFtYvS7GQwgcH6iLllXqrQ4JzS', '1d45d402-97cc-4b9e-ad3b-08cb624b859a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.107580971280804, 129.03246380102908, '부산광역시 중구 중구로 121 (대청동4가)', '재단법인천주교부산교구유지재단 메리놀병원', ST_GeomFromText('POINT(129.03246380102908 35.107580971280804)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500002', '$2b$04$WKX5Zk5KTiDtvN6LkZjKnOuDD0azcyn5alWMmZPuRfDTzdX.EXec6', 'a9bfd20b-7fb8-4929-a9f7-b37b5a2d6817', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.141852541291165, 126.92158688926376, '광주광역시 동구 제봉로 42 (학동)', '전남대학교병원', ST_GeomFromText('POINT(126.92158688926376 35.141852541291165)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600050', '$2b$04$2ZQi.cspcj6DB.bTWPwNXej6NN2eajWFUtqMLvZPEPsi6rgEqCr4W', 'c6fa9bb4-8baf-42f8-913c-2c31ab9ec2c1', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.63681860822126, 126.75789950922355, '전라남도 강진군 강진읍 탐진로 5', '전라남도강진의료원', ST_GeomFromText('POINT(126.75789950922355 34.63681860822126)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600056', '$2b$04$V70UbHaJn2EzHuYtns7PRO7BISlIJqiH4MtSxgMaKGtukPaitQscy', '4cbd9ac3-b5f0-4a7b-abd4-35cd2da3abf9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.95798908690572, 127.48303613267494, '전라남도 순천시 서문성터길 2 (매곡동)', '전라남도순천의료원', ST_GeomFromText('POINT(127.48303613267494 34.95798908690572)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500002', '$2b$04$fqxb80cggZearMvHY28lJeaTT5AG2I6w/zwJhJHwrD9/dDXCM0SFK', '79464bdb-c5b8-432c-aef1-7f265960e190', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.84697279303408, 127.1393674038135, '전북특별자치도 전주시 덕진구 건지로 20 (금암동)', '전북대학교병원', ST_GeomFromText('POINT(127.1393674038135 35.84697279303408)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500007', '$2b$04$1LJVf7jgCDqEgRFugIKv4eWdqiLO7deA2n0me1na9zOS4EDRRhaue', '8fc6dac7-885f-45bf-bec4-6dfd2e4597d4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.95497072788432, 126.71189936455204, '전북특별자치도 군산시 의료원로 27 (지곡동,(지곡동, 군산의료원))', '전북특별자치도군산의료원', ST_GeomFromText('POINT(126.71189936455204 35.95497072788432)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500004', '$2b$04$XMRefbXkOxuA.jhhz6io6OLyOBgBC6dwdXji7mjCOcncYlo1V/w52', '964051c0-58c0-425a-8e52-3a6ea390f0cd', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.43189945917936, 127.40719103150715, '전북특별자치도 남원시 충정로 365 (고죽동)', '전북특별자치도남원의료원', ST_GeomFromText('POINT(127.40719103150715 35.43189945917936)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2500003', '$2b$04$keiuVdqqkmsD05FL/aB8nucvB16ZRVskKQqkmlNIKF0DBq35WOnZe', '7b121dbf-055a-4d7d-93b0-c90a51ee2ccd', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.839839476593305, 127.16713261021835, '전북특별자치도 전주시 덕진구 안덕원로 367 (산정동)', '전주고려병원', ST_GeomFromText('POINT(127.16713261021835 35.839839476593305)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800003', '$2b$04$5yPEbB0G8Xw4XjGZiHhkme1lSvjoCVLjNBGki67IgEb1ckT2XLTdq', '77a9cef9-f5d0-446c-a12f-13b3c8a084f2', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.1793997485, 128.0899464997, '경상남도 진주시 진주대로 885 (강남동)', '제일병원', ST_GeomFromText('POINT(128.0899464997 35.1793997485)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2900007', '$2b$04$6G7r3xGDfZI/Xtfruq7b8.KOu5Zql7DrKGtOYhXQiLjMbpXadoPJe', '037a5884-6131-49c7-9748-0cad63cceaf4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 33.46727330825531, 126.54525733713078, '제주특별자치도 제주시 아란13길 15-  (아라일동,제주대학교병원 (아라일동))', '제주대학교병원', ST_GeomFromText('POINT(126.54525733713078 33.46727330825531)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2900002', '$2b$04$NEvOKi9CnA3vtdYbrtoq4uzu6iE/WPAu7Ovmn1.vqEyx5PrjaoLVe', 'e6f61757-c1a3-419b-80d7-162b77f04f5a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 33.255354935811724, 126.56420131670261, '제주특별자치도 서귀포시 장수로 47 (동홍동)', '제주특별자치도 서귀포의료원', ST_GeomFromText('POINT(126.56420131670261 33.255354935811724)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2900001', '$2b$04$xpnMJVVlnXabQwE28m/Koepy7JNu5CeliLcpRqKXfic2rsEqb5pZK', '13f38f7b-c624-46cd-b377-3edd7efd680b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 33.489946745300735, 126.48507635686154, '제주특별자치도 제주시 도령로 65 (연동, (연동))', '제주한라병원', ST_GeomFromText('POINT(126.48507635686154 33.489946745300735)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500001', '$2b$04$osdTi.70GCuX2BrCihS6peEPRK3Gaj6dtco6KCTiB.0.6ZPuIVqsq', 'ca679cb4-8a34-4985-b1fd-99b42463cc46', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.13854706991291, 126.92683853357782, '광주광역시 동구 필문대로 365 (서석동)', '조선대학교병원', ST_GeomFromText('POINT(126.92683853357782 35.13854706991291)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2114449', '$2b$04$/rry80EEZitHU6DtboYvXuXqUsKaOJTyeg8KXXqX41/553LmWZZSO', '3208d23d-a4e8-42a3-add6-3a85fe82a542', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.15432658078726, 127.06824064919108, '경기도 오산시 오산로 307 (오산동)', '조은오산병원', ST_GeomFromText('POINT(127.06824064919108 37.15432658078726)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200026', '$2b$04$aMj9RoJSO9nUN/TBC0LQj.0EYkV6hEIJTRT6H2KCl1E316sQC0YOa', '03c65c36-a75a-4c7b-9dfa-ad1064a96ed8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.1407239889452, 129.05906375734872, '부산광역시 동구 범일로 119 (범일동)', '좋은문화병원', ST_GeomFromText('POINT(129.05906375734872 35.1407239889452)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2118788', '$2b$04$BtABnkHk6mEQJQ42mLRNVuC57NkTawmU82xawbUEb8gmHIsJDQXSS', '909ca189-8edd-47e7-ad5b-acd9960fc6b9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4245974351169, 126.885910072451, '경기도 광명시 덕안로 110(일직동)', '중앙대학교광명병원', ST_GeomFromText('POINT(126.885910072451 37.4245974351169)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100003', '$2b$04$v4VbkBQBuLNId5uSPTTvdevudqvYCLGqM9WAM73PJn1XE/8TcQHyu', 'e4ea7df3-9159-47fb-a4d3-22ce42d035d7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.50707428493414, 126.96079378447554, '서울특별시 동작구 흑석로 102 (흑석동)', '중앙대학교병원', ST_GeomFromText('POINT(126.96079378447554 37.50707428493414)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600040', '$2b$04$ulIxZuntRYEIbTTbsZWtMux/U5KvSwdV5Ipr8rB85dvYl55rqf4iC', 'e04e7e69-8d1d-4f5a-bdcb-f2f5306ad5c3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.482432541575456, 126.26412429142383, '전라남도 진도군 진도읍 남문길 48', '진도한국병원', ST_GeomFromText('POINT(126.26412429142383 34.482432541575456)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2502031', '$2b$04$3TSdpEB4xVivzc0sFmWZsuI4Jknbti1rpaXbQLZ5sWVOaK0drS31C', 'b6b1334d-4b7c-4f91-a467-5b2bdd28b695', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.79518695884379, 127.43207008323515, '전북특별자치도 진안군 진안읍 진무로 1145-0', '진안군의료원', ST_GeomFromText('POINT(127.43207008323515 35.79518695884379)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800037', '$2b$04$/ef4dkBUdctD8m7D4WHPfuCb/8pJAA0wmZAMJ7dNmbGKCftcOT84y', '6883f22a-28cc-47a4-b106-5275d1e9117e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.185376569664825, 128.06939115519654, '경상남도 진주시 진양호로 370 (신안동)', '진주복음병원', ST_GeomFromText('POINT(128.06939115519654 35.185376569664825)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800044', '$2b$04$axbDSqeZYDmuJZRGFOd1j.i8IoCwCCblLMyfqegUuK7HuW6EAPFfG', 'a1f341e8-1f90-4d7c-9917-8ba270cdcf5d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.17448762105697, 128.09295064588534, '경상남도 진주시 진주대로 829 (주약동)', '진주세란병원', ST_GeomFromText('POINT(128.09295064588534 35.17448762105697)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100057', '$2b$04$IJ3uCGtzTA0vSnU.ADmLue10//jcn3K9MjtHAUo4ld.p2fCoEExna', 'cb4be046-98f5-4fdb-9b2b-4bc3f3f1a49e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.506800025850865, 127.03466865188072, '서울특별시 강남구 논현로 566, 강남차병원(역삼동650-9, 606-4, 605외2필지(지하7층~지하1층, 지상2층~7층)) (역삼동)', '차의과학대학교강남차병원', ST_GeomFromText('POINT(127.03466865188072 37.506800025850865)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700007', '$2b$04$W96QAtZe1vkQMAGpHIvcuOX7WCHOv7MOySNfs7EpVHRmYtXG/K7g6', '07f0f213-6e37-410c-ab5b-32edf0fd08c8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.11452808183706, 128.34054647885029, '경상북도 구미시 신시로10길 12 (형곡동)', '차의과학대학교부속구미차병원', ST_GeomFromText('POINT(128.34054647885029 36.11452808183706)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100030', '$2b$04$sGoHV1w4nj1pKQJIXPaZkOZFiS8UMQwbawbtK.I2eYsvPAjb46frS', 'a59cdca1-3db1-466c-8e02-9e62dc3288c7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4101145912911, 127.125083678928, '경기도 성남시 분당구 야탑로 59 (야탑동)', '차의과학대학교분당차병원', ST_GeomFromText('POINT(127.125083678928 37.4101145912911)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100155', '$2b$04$CQ2Ccp8VJvv.10ubfnedOO62e936sEeMbvZ4QmegYXOW/J4XZDSLu', '8c56d5f1-8163-4ef1-8750-bf265bbd4c85', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.41095382720454, 127.26022384023878, '경기도 광주시 광주대로 45 (경안동)', '참조은병원', ST_GeomFromText('POINT(127.26022384023878 37.41095382720454)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2803505', '$2b$04$/cgytHU7sft6kJjBiHVnZ.HNvs0ZINrP1E039JBUOGiTGdr6gyuoO', 'a5e9ea79-99ea-4713-813c-f2a163d48cdf', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.19921298418469, 128.7078072393552, '경상남도 창원시 성산구 삼정자로 11 (성주동, 창원경상대학교병원)', '창원경상국립대학교병원', ST_GeomFromText('POINT(128.7078072393552 35.19921298418469)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800004', '$2b$04$rlEUR.n80sTpFfwlPvKixuHJiyPqRmmC5fXLg0fPGdULsm9o9M8S2', '5dff1f3b-0378-457d-8d35-54ccdf74fe61', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.2372418321, 128.6444852768, '경상남도 창원시 의창구 창이대로 45 (명서동)', '창원파티마병원', ST_GeomFromText('POINT(128.6444852768 35.2372418321)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800007', '$2b$04$V2RTPyblysiHk6xHn/FLXuWJpccWzK4kUUiGDrQXVG1SPziSMkuSK', '5ebf5e1f-66bf-4f38-8de4-70de35562259', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.2379796340839, 128.699059273138, '경상남도 창원시 의창구 용동로57번길 8 (사림동)', '창원한마음병원', ST_GeomFromText('POINT(128.699059273138 35.2379796340839)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2201730', '$2b$04$C0l8f4wY65zH91qPpgQDRu0ZzmoMvplYriDwkkHd04FKAT7B0GlKe', 'b612fcfe-7052-42ca-9bc2-c1e138b8c151', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 38.15033057072112, 127.30802768817259, '강원특별자치도 철원군 갈말읍 명성로 208-0', '철원병원', ST_GeomFromText('POINT(127.30802768817259 38.15033057072112)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500011', '$2b$04$0BZTy8cejjKq5pDk1Fx18OV5V/9bvBaX4g1IYUDzvkvn7G7wpHeVG', 'b3082999-1f56-4d56-8658-0e5d3b5bce00', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.22113373578457, 126.84530205666944, '광주광역시 광산구 첨단중앙로170번길 59 (쌍암동)', '첨단종합병원', ST_GeomFromText('POINT(126.84530205666944 35.22113373578457)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2700554', '$2b$04$9VExF.bwVwbvvnowd8.rSuqhYJr6fWLNHZIcdb6cCz9qQU2BA8V4m', '56059ce1-0120-4f99-b604-3f6c7cef0f3e', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.43104059070308, 129.0526608512385, '경상북도 청송군 청송읍 의료원길 19', '청송군보건의료원', ST_GeomFromText('POINT(129.0526608512385 36.43104059070308)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2400032', '$2b$04$RNilkM4H.ZDRXMu/C1z8Z.SzbF8osz0tvTwZqx4GPkbLkDiGBbw1m', '848fb7a1-ead0-41ac-b1a4-4d0594c0b435', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.45529646339589, 126.80455836964052, '충청남도 청양군 청양읍 칠갑산로7길 54', '청양군보건의료원', ST_GeomFromText('POINT(126.80455836964052 36.45529646339589)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300008', '$2b$04$QbGFoL3IEDssESTJsRGrOup7lckLdIiei1GT5Bsvam1PtEiWmhJXe', '2111ba8a-a2e4-498d-809e-e3cbaffcb586', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.673801330174406, 127.48546957073641, '충청북도 청주시 청원구 주성로 173-19 (주중동)', '청주성모병원', ST_GeomFromText('POINT(127.48546957073641 36.673801330174406)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300019', '$2b$04$.igAWp0ojvNZs1UUWWcU..3H4oIHbmY.TIk/UgWD11WwA2n5DB2iq', '2702daf2-eb2a-4b3e-b788-87a2ddda46b5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.632987414750296, 127.42463434124868, '충청북도 청주시 흥덕구 비하로 65, 현대병원 (비하동)', '청주현대병원', ST_GeomFromText('POINT(127.42463434124868 36.632987414750296)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1117070', '$2b$04$Tyko/65iBDpj7rfSrIdEiebA.WOb1wlMA/BUKTQQfBldbaC3b4FKa', 'cf7da73f-6101-4f03-97fc-118a73eb9aa4', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.604769594378, 126.923855760856, '서울특별시 은평구 서오릉로 45, 최원호병원 (녹번동)', '최원호병원', ST_GeomFromText('POINT(126.923855760856 37.604769594378)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100150', '$2b$04$ECOwj5saSnKSBjrGcmdnO.REdrF5xhc92qY4Au.wxGk92FIqUr8PO', 'dff632dc-f8b0-4a8b-82ed-5287bc3c7fa6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.7499600932, 127.0450970956, '경기도 의정부시 평화로 650 (의정부동)', '추병원', ST_GeomFromText('POINT(127.0450970956 37.7499600932)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600001', '$2b$04$O8CUHFDcWZDIaP.ewDuNlORBjQAH0qZE0nYKdmlxqMHtCurYFJngO', 'b34f4329-10d5-4d58-959c-bd28ad230558', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.31696055071064, 127.41546133417684, '대전광역시 중구 문화로 282 (대사동, 충남대학교병원)', '충남대학교병원', ST_GeomFromText('POINT(127.41546133417684 36.31696055071064)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300001', '$2b$04$jZ0u98IMFSvXGBCSaA9jVOuTQAN/1yILXwceP.xgBglkAWLfOvXL6', 'af4259e0-bb47-40d4-9794-9c4281631e07', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.624166824834546, 127.4614360502226, '충청북도 청주시 서원구 1순환로 776-0 (개신동,충북대학교병원)', '충북대학교병원', ST_GeomFromText('POINT(127.4614360502226 36.624166824834546)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2302306', '$2b$04$GDgYoyl3c.kjyEhsHcWVUuCUygNR2i.UejYqwOgeS.mVK6N30/bia', '87636d41-4005-42be-9a1d-66f9cc47a42f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.9804284762737, 127.927925696639, '충청북도 충주시 국원대로 99-0, 0동 (교현동,미래병원)', '충주미래병원', ST_GeomFromText('POINT(127.927925696639 36.9804284762737)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400010', '$2b$04$uQtsiwyqpY9OeU/pr8BKHeHibZfUDFpU3hMOMz1YbxuNYqKgVjEay', '0e912853-c256-4f07-b0b7-b34ad8cf7acc', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.45905455773722, 127.10921562289595, '충청남도 공주시 무령로 77 (웅진동)', '충청남도공주의료원', ST_GeomFromText('POINT(127.10921562289595 36.45905455773722)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400006', '$2b$04$5cRHGTTAo.f7l1Jsi32/X.7qkzXyVht8EipPailfaj3Ev6gSi27BK', '6b1956ac-1fcf-4a11-ae33-cee3161d3592', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.77556877677842, 126.46515725738563, '충청남도 서산시 중앙로 149 (석림동)', '충청남도서산의료원', ST_GeomFromText('POINT(126.46515725738563 36.77556877677842)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400005', '$2b$04$olZHJnLNVOS3GsEUPPm5ku2ORQwc4y6S2sNxx9XsuTw0CwLmGe5/a', '43ff9daf-9e2e-4de5-b44b-0b865f616508', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.775359921186194, 127.17992025598447, '충청남도 천안시 동남구 충절로 537 (삼룡동)', '충청남도천안의료원', ST_GeomFromText('POINT(127.17992025598447 36.775359921186194)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400007', '$2b$04$8Q2VI77e5VFoA5Lotainb.3nJWVJ2xPigF22NfXk4IlBqDOsRAB/q', 'fb89570f-29b9-4008-b60d-cd62672477f3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.59933992060475, 126.67440672396913, '충청남도 홍성군 홍성읍 조양로 224', '충청남도홍성의료원', ST_GeomFromText('POINT(126.67440672396913 36.59933992060475)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300006', '$2b$04$6smR9pwjhfQvEg3fIYddCuoNuevO36Sj4Pl60vG7D5yAApG.FBMJO', 'cabaf776-327d-456a-aa6b-ad7af0628294', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.6401389722304, 127.473087555201, '충청북도 청주시 서원구 흥덕로 48-0 (사직동,청주의료원)', '충청북도 청주의료원', ST_GeomFromText('POINT(127.473087555201 36.6401389722304)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2300004', '$2b$04$l0leZgqiZz0hsnE1C1DOMeeg.E3L4jmZSe7iC0VaduXzGFmjYzMJ2', '8231fbfd-2c6a-4331-ad45-fed7425b9705', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.97956732195825, 127.9703586011334, '충청북도 충주시 안림로 239-50 (안림동)', '충청북도충주의료원', ST_GeomFromText('POINT(127.9703586011334 36.97956732195825)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300010', '$2b$04$2tMCofY7VQpCqrOwOU11PuSRN0gZcyKJH4Lw1mG8J.75Aoa72LqS.', '34475f16-0ba4-40a9-befe-026c724a1aef', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.9560830613237, 128.564408469835, '대구광역시 북구 호국로 807, 칠곡경북대학교병원(임상실습동 1~11층 포함) (학정동)', '칠곡경북대학교병원', ST_GeomFromText('POINT(128.564408469835 35.9560830613237)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200089', '$2b$04$E84hMtvvAzKlHoUtX8PqVehjsPRX05JynGdhvwmWB.MmnI/LwlK5S', '10661f3c-8bf9-4703-a195-b4d118bd6726', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.10658381193713, 128.96489218029475, '부산광역시 사하구 낙동남로 1401 (하단동)', '큐병원', ST_GeomFromText('POINT(128.96489218029475 35.10658381193713)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2400033', '$2b$04$FzdpQw7psZSVzfvSFdEfdusSoHHczC9EHiNarsK7OKliAUzB49Jau', '357cb0f9-2a8a-4580-a748-321b4aa0a16b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.75191402131483, 126.32320735565844, '충청남도 태안군 태안읍 서해로 1952-16', '태안군보건의료원', ST_GeomFromText('POINT(126.32320735565844 36.75191402131483)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800062', '$2b$04$36vL6vkLfpRFQ807NfdTNOD9kFvPoQnSHtTB0pFkJUAarpBxVzgD.', 'ee939e7b-8853-4fbc-b3d3-b03d6f433dea', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.5421522771, 128.4934147264, '경상남도 창녕군 창녕읍 교리1길 2', '태황한성병원', ST_GeomFromText('POINT(128.4934147264 35.5421522771)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2200026', '$2b$04$I/2m6JAgMnLBlDc5QIw2b.2N8xco9yElzAKpWbVWRfKhdhGv6f0Pi', '6ed9e064-d873-4935-a742-6af81ef13094', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.360577433652736, 128.3890508672411, '강원특별자치도 평창군 평창읍 노성로 11', '평창군보건의료원', ST_GeomFromText('POINT(128.3890508672411 37.360577433652736)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700016', '$2b$04$DMdUFpUZjeQI4gHIHdTH9Ox2ho6mDBpqph1qO81Sr3xUSQXVm//TG', '7d138baa-37cf-4885-abaf-2007c1e63b40', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.01585627687779, 129.33981334567275, '경상북도 포항시 남구 대잠동길 17 (대잠동)', '포항성모병원', ST_GeomFromText('POINT(129.33981334567275 36.01585627687779)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2700002', '$2b$04$27w/5UUhUSxDyjjKsVP6dO1KUNOws7NDEqA6kE3DNazi9ZlR.XZJC', 'd7fdfadf-13b7-4e0c-b319-f9269532c1ea', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.0181008246, 129.3615706051, '경상북도 포항시 남구 포스코대로 351 (대도동)', '포항세명기독병원', ST_GeomFromText('POINT(129.3615706051 36.0181008246)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2804216', '$2b$04$9DinAFp.5tfYVNcFdD2AsO712.igyzLAC4hgep21NbyU.dBcGmekS', 'afeb7466-2a71-4ffb-8eca-150df12f4304', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.0822158154719, 128.086480599028, '경상남도 사천시 사천읍 진삼로 1468-8, 하나병원', '하나병원', ST_GeomFromText('POINT(128.086480599028 35.0822158154719)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500017', '$2b$04$mX9uE42TQhzZynvzBHUcYOWKkYDJkhEkuz5ejDOzqK1NvwBKxhmBG', '00089884-c63b-4db2-a234-07a3ffa408d9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.1664063968, 126.800894228816, '광주광역시 광산구 용아로 259 하남성심병원 (산정동)', '하남성심병원', ST_GeomFromText('POINT(126.800894228816 35.1664063968)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1403097', '$2b$04$FBNPuiAtoyleYI.3XRPYyeCXwIQVjHaTZ.fCduGaygFDJKG.WK8wm', '9793e9bb-0a34-419e-99b0-ec9340b6b2d6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.48951057425082, 126.5632024449348, '인천광역시 중구 하늘중앙로 193, 조양타워 6층(일부),7층 605호, 701호 (중산동)', '하늘정형외과의원', ST_GeomFromText('POINT(126.5632024449348 37.48951057425082)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800826', '$2b$04$vpLH215N5E9lOTxP4qZ3/e.0Yks9qg7WHIPWc90Mr9TrlUv/pao2e', '7dabfd71-1c39-4e90-9dfa-4e9818bf2a0f', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.07144347237017, 127.75322730361015, '경상남도 하동군 하동읍 연화길 6', '하동중앙의원', ST_GeomFromText('POINT(127.75322730361015 35.07144347237017)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200025', '$2b$04$6LbNPv.NCHQ17eMTEdN2Uu7QgbxAxzqrLCyp.FYfwC5/P8I/JiXYC', '4b5acb24-9e33-4911-a73c-e407bcd8b717', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.147036979509224, 129.05854773411613, '부산광역시 부산진구 중앙대로 605, 지상1층~지상9층 (범천동)', '학교법인 춘해병원', ST_GeomFromText('POINT(129.05854773411613 35.147036979509224)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200019', '$2b$04$szJY92QH9cS0f4Ip/gNHaeAIjgy5DalPn3Ecdsn9MDCuMSRhf/Jhq', '7d5a1241-74d7-474d-82d3-af510e7c1d86', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.169922174960384, 129.0767443760438, '부산광역시 부산진구 양정로 62, 지상2ㆍ3ㆍ10층 각 일부/ 지하1ㆍ지상1ㆍ지상4~지상8층 전층 (양정동)', '학교법인)동의병원', ST_GeomFromText('POINT(129.0767443760438 35.169922174960384)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600005', '$2b$04$wK.j9ohlm6AhRT31kHu94OoNDiuGddYHmWMjAWzKOvwsODK2pRV2i', 'da5bd51e-5e79-43f2-98ea-d3234b90e724', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.32302490017959, 127.42027313317438, '대전광역시 중구 대흥로 64 (대흥동)', '학교법인가톨릭학원가톨릭대학교대전성모병원', ST_GeomFromText('POINT(127.42027313317438 36.32302490017959)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100012', '$2b$04$f3DffEd2njO9kzGg/yYKMumKGL6sLtmx8rV7OU9h1zx7ktBWzraf6', '709356ae-9d46-4e34-bd54-9c45551e0fd0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.501800804785276, 127.00472725970137, '서울특별시 서초구 반포대로 222 (반포동)', '학교법인가톨릭학원가톨릭대학교서울성모병원', ST_GeomFromText('POINT(127.00472725970137 37.501800804785276)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600006', '$2b$04$JeR13JRKfgXL3BJQBrf5NezmAr8X3CTEPeL0y3bH.QAkdKef9eMgm', '678f1698-bcde-4c73-bd59-948596d54b54', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.306711701457246, 127.34263046359918, '대전광역시 서구 관저동로 158, 건양대학교병원 (관저동)', '학교법인건양교육재단건양대학교병원', ST_GeomFromText('POINT(127.34263046359918 36.306711701457246)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400038', '$2b$04$WsNrDVfbmhZRh2UpHjo1uu/m3doXLQy5DcCBV1BPQj5OEBZcCuaAe', '1a616392-b8cb-4ba2-a95c-41ea26eeae30', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.275554094438235, 126.90169662482884, '충청남도 부여군 부여읍 계백로 200', '학교법인건양교육재단건양대학교부여병원', ST_GeomFromText('POINT(126.90169662482884 36.275554094438235)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100008', '$2b$04$E2eMBHcAElv2tV1UGA8WBuZg/VH2L7foQP8zxc7wOJMOtcx7VMfTC', 'c153de8f-c0bd-4156-b3b4-38a53e51269d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.58715608002366, 127.02647086385966, '서울특별시 성북구 고려대로 73, 고려대병원 (안암동5가)', '학교법인고려중앙학원고려대학교의과대학부속병원(안암병원)', ST_GeomFromText('POINT(127.02647086385966 37.58715608002366)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400001', '$2b$04$aAOcJgitFu8EeSJIea9iSOWf6t8LhySLqZO.7CWSDURHx51JCMuLa', '9b792d69-18ee-44b8-80c3-b83e26e822ff', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.8023584971179, 127.135666806479, '충청남도 천안시 동남구 순천향6길 31 (봉명동)', '학교법인동은학원순천향대학교부속천안병원', ST_GeomFromText('POINT(127.135666806479 36.8023584971179)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800020', '$2b$04$yjflNZWOvRGA3894l7rsb.SiF.JlgCpJPW.rCUUX7GJLIfQ3.N726', '64438d5b-3360-4acd-a06a-2f6e0e721f60', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.242599227316994, 128.592430520838, '경상남도 창원시 마산회원구 팔용로 158 (합성동, 삼성창원병원)', '학교법인성균관대학삼성창원병원', ST_GeomFromText('POINT(128.592430520838 35.242599227316994)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1700004', '$2b$04$DGDRaDUYBWH7B.JO7iOmeO5sEKeOfrA2Y5ocBpHnI/iSmSEKMvpf6', 'eff83076-6aa2-407a-9647-7c74659df9e2', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.5200593154, 129.4288047478, '울산광역시 동구 대학병원로 25, 울산대학교병원 (전하동)', '학교법인울산공업학원울산대학교병원', ST_GeomFromText('POINT(129.4288047478 35.5200593154)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1600002', '$2b$04$91sUVVoRdMbGQG5E47wTxOlqYALHuHh/KwpKAGbFJjPVWwkVWU2Be', '66630a96-3840-4879-b7f1-c19a1546e1e3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.355068712678154, 127.38199955857135, '대전광역시 서구 둔산서로 95 (둔산동)', '학교법인을지학원대전을지대학교병원', ST_GeomFromText('POINT(127.38199955857135 36.355068712678154)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2117994', '$2b$04$KhMRvmFiexi2/n3u1ZFDhOvMpcrNooY/WST4I4s3n.EKnbNjlZpqi', 'e8843ad9-4cf1-49d6-a53e-39cc67201075', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.7518290378344, 127.050695679688, '경기도 의정부시 동일로 712, 을지대학교 의정부캠퍼스 및 부속병원 (금오동)', '학교법인을지학원의정부을지대학교병원', ST_GeomFromText('POINT(127.050695679688 37.7518290378344)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100163', '$2b$04$B4pWIwcunybFOXQLvPLmCuZ6uq7XEbrKWdet92RjgQu8uDifSIVs.', '22dbb2f0-68d7-45bf-a74c-8235c196c4c5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.5224047841717, 126.890913736375, '서울특별시 영등포구 영등포로 83, 한강수병원 (양평동1가)', '한강수병원', ST_GeomFromText('POINT(126.890913736375 37.5224047841717)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200016', '$2b$04$gesturkGToC0orKIG01FSuya.QbowPzaWw10fNJi8YUgSxsSv86De', '02ddf354-10f3-4c63-a1ec-58e379aaeaae', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.15333436517864, 129.00656514354415, '부산광역시 사상구 백양대로 420 (주례동)', '한국보훈복지의료공단 부산보훈병원', ST_GeomFromText('POINT(129.00656514354415 35.15333436517864)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1300011', '$2b$04$zMsCCWN1F6Dr1ON.7IFT1Oj4UlfOj6EoBBjXSmoH9Cj5LAdIvK5IG', 'f2bc1560-19e9-462d-adf6-88d5027580a7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.80313747018647, 128.55164640976287, '대구광역시 달서구 월곡로 60 (도원동)', '한국보훈복지의료공단대구보훈병원', ST_GeomFromText('POINT(128.55164640976287 35.80313747018647)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100053', '$2b$04$13JKnb8hptNZrg6dh3sHSuLGhzfEEfVsq38ukIuljDmcZF6QfeF2W', '8650b546-18e4-42ca-9ba0-63e8eee703ef', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.528220900896635, 127.14671886173552, '서울특별시 강동구 진황도로61길 53 (둔촌동)', '한국보훈복지의료공단중앙보훈병원', ST_GeomFromText('POINT(127.14671886173552 37.528220900896635)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100027', '$2b$04$v5vr2M5PP.PTbkMrP/wrleplOZi.HST87wXjmUcX2V8Sh6oqb0xdC', 'c93ab7cc-fe86-4c06-87df-cc4bd34ee009', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.628815981330355, 127.08269315796588, '서울특별시 노원구 노원로 75, 한국원자력의학원 (공릉동)', '한국원자력의학원원자력병원', ST_GeomFromText('POINT(127.08269315796588 37.628815981330355)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100055', '$2b$04$L2ZVBCzKKJgA7cKjwGO46eOPXI6sPcqyj5Kw3n2UXyH0ukADW8H5a', '55b540ad-3e91-48fe-a292-9f74972a7260', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.4932492859, 126.9086725295, '서울특별시 영등포구 신길로 1 (대림동, 강남성심병원)', '한림대학교강남성심병원', ST_GeomFromText('POINT(126.9086725295 37.4932492859)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100046', '$2b$04$9etyHuT1FrOsY485RAs4SOcUzWfRrcPtobaTPtpQ0guzRQYMSjU1C', '839e173c-7292-41f2-868c-ef043f2efffe', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.216650193541184, 127.08000809235827, '경기도 화성시 큰재봉길 7 (석우동)', '한림대학교동탄성심병원', ST_GeomFromText('POINT(127.08000809235827 37.216650193541184)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100004', '$2b$04$QnvlHhhUhDUDeHvn2Qk6oOpsLBRulNmIwppTwP3UTykE6qdl.rya2', '5ac74bd9-01c0-4912-a285-93975190f60d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.3916511961, 126.9619708207, '경기도 안양시 동안구 관평로170번길 22 (평촌동)', '한림대학교성심병원', ST_GeomFromText('POINT(126.9619708207 37.3916511961)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200013', '$2b$04$3z39vZhYc2zoxu.qRJhkVOlrw12vZwng6yGy4pHtiBjZFQ9fU.scO', '455971d1-ed5b-4f2e-b86b-52a8c1bdee62', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.88413581388737, 127.73989454269613, '강원특별자치도 춘천시 삭주로 77 (교동)', '한림대학교춘천성심병원', ST_GeomFromText('POINT(127.73989454269613 37.88413581388737)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100038', '$2b$04$wm8t9meC/8yD7aoODmnCseo0DlhpslFsxlV7u9UCAXq0Mc9bPLQa6', 'bb4be15e-3c4e-4459-98ec-4ea036ec4ac5', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.52346674579277, 126.91033000120589, '서울특별시 영등포구 버드나루로7길 12 (영등포동7가, 한강성심병원)', '한림대학교한강성심병원', ST_GeomFromText('POINT(126.91033000120589 37.52346674579277)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2900005', '$2b$04$3bjufv5YeZ791tNedqHx0ONys5ZKrN1DLXgakW8KjNlVitjboFaiW', '5ade5e5b-1bca-477e-bbfe-ed2f1116f6a8', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 33.4962612399279, 126.54622454609037, '제주특별자치도 제주시 연신로 52   (이도이동)', '한마음병원', ST_GeomFromText('POINT(126.54622454609037 33.4962612399279)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100039', '$2b$04$KgFA0ZFZQlYMIu/nvPU1euhwNzWhACmeARiAa2LDgkcI/Nalu6vp.', '518309da-17c0-474a-b661-426229d44fac', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.6012760077, 127.13250756940002, '경기도 구리시 경춘로 153 (교문동)', '한양대학교구리병원', ST_GeomFromText('POINT(127.13250756940002 37.6012760077)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100013', '$2b$04$P7KqqOSR8aafObblO01e/.zX6xYjAA3.t4cftbLucQGrw79XWcyMq', 'bc62ea9a-8eae-466d-b08c-3349f3cd3813', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.559944533564746, 127.04488284061982, '서울특별시 성동구 왕십리로 222-1 (사근동)', '한양대학교병원', ST_GeomFromText('POINT(127.04488284061982 37.559944533564746)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800043', '$2b$04$z75DBHQJuJJJLWCDDU42veC0UQ1cafCcUMZFvRFdd8x6YBVjGFzWy', 'e49a194d-479c-4253-b3a2-5efae84dd79d', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.16696519825003, 128.128547657113, '경상남도 진주시 범골로 17, 한일병원 지하1 1~7층 (충무공동)', '한일병원', ST_GeomFromText('POINT(128.128547657113 35.16696519825003)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800080', '$2b$04$UK1Kr1odVMqAmTNyrHcg8.vG3M63xwe/m7H1K0AU9D..wNVrqSLUu', '94ce44ab-fae0-42bc-b674-adc1cbd158f9', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.52046827900683, 127.72924773802185, '경상남도 함양군 함양읍 고운로 70', '함양성심병원', ST_GeomFromText('POINT(127.72924773802185 35.52046827900683)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600077', '$2b$04$xKr6/Q7lBKor1xrLc/AqBuyOjx7e3f5h/9Mk8R1OmKDG/UGedkXfa', '28c83183-bb07-4f77-9456-0fac5566be19', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 34.58423738321411, 126.64658297551144, '전라남도 해남군 옥천면 해남로 597', '해남우리종합병원', ST_GeomFromText('POINT(126.64658297551144 34.58423738321411)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1500057', '$2b$04$rvjPXjedy4JLAdBG5TmY9OLWH8Tv5KXUWcYLG90yqVmifefecRPmu', '81568d19-8a44-4c3c-a5ac-607ee3f8d9aa', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.15846280570811, 126.9066923373126, '광주광역시 북구 경열로 216 (유동)', '해피뷰병원', ST_GeomFromText('POINT(126.9066923373126 35.15846280570811)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1303449', '$2b$04$KGdLWcX6x6nDfHb0SXNbeep9itJG.XEvuoBrwDYln.XK7N9xzmQau', 'de92e692-d056-4390-94fa-f4463412f95b', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.69330550768229, 128.47043956090056, '대구광역시 달성군 유가읍 테크노순환로12길 4, 1층,4~6층(1층 사우나홀,113~117호,119~120호,405~407호,5층,601~607호', '행복한병원', ST_GeomFromText('POINT(128.47043956090056 35.69330550768229)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2800042', '$2b$04$rdKjkWv33G2UURobsAwjG.LI4PyFe7/iEp3D1.Na.094p9Gckbq2K', '9db770b5-2345-41a6-a313-35b878e4e219', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.37461994215032, 128.7114865036199, '경상남도 밀양시 하남읍 수산중앙로 56-2', '행복한병원', ST_GeomFromText('POINT(128.7114865036199 35.37461994215032)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100037', '$2b$04$Tfv/xMb6b4YI3SJ7sNPx3.2JxFOhIRar/GJs9TnFKhUGErnCY0wra', '9fd51b74-2c97-4f9a-a5be-9e26ba8198f0', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.715486551355895, 127.17984989970033, '경기도 남양주시 진접읍 봉현로 21', '현대병원', ST_GeomFromText('POINT(127.17984989970033 37.715486551355895)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2400039', '$2b$04$oMDTFCPv5/HDJhPM2w8D0eyFhU.onf2BD1NC/tAgfLzxOY7.pr7zS', 'bcffd3b1-e593-4f85-98c8-8333a8db328c', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 36.78311829920936, 127.00097027728451, '충청남도 아산시 시민로 388 (온천동)', '현대병원', ST_GeomFromText('POINT(127.00097027728451 36.78311829920936)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1400004', '$2b$04$//F4f/Z./xIVqTDwv5omXOkE1eVtlMzcANIinp/NcId2UfKE3aXre', 'f2acf7eb-37c5-44ca-a4a9-d7e090c1e929', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.461743833494644, 126.64314168953122, '인천광역시 미추홀구 독배로 503 (숭의동)', '현대유비스병원', ST_GeomFromText('POINT(126.64314168953122 37.461743833494644)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100051', '$2b$04$Fkk5cF8nMA3yMNTtUwR9keuXm6HlMKCRP2N7M98BnBLOhvKSPkK0y', 'a7de3ee7-9856-4be2-870d-28731a397e47', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.535315660180416, 127.08360130258502, '서울특별시 광진구 자양로 85 (자양동)', '혜민병원', ST_GeomFromText('POINT(127.08360130258502 37.535315660180416)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2120077', '$2b$04$tsOSVWrl0jcGo0D.tG2YveAgOFvAkVaQo0H47KbDrdYPoJ.iHbm32', '62481bf1-93ba-47df-a1a8-c3e25bd35f64', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.6501095660175, 127.238321935956, '경기도 남양주시 경춘로1308번길 4, 1층일부~10층 (평내동)', '혜성병원', ST_GeomFromText('POINT(127.238321935956 37.6501095660175)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100019', '$2b$04$phXghd3KlJMHj/w17hvkLuSZfYibByfgT6gLm/G.J9i51wDVc/mOO', 'c38e64fc-1d5d-490f-9917-59669117cd50', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.52844147447355, 126.8636640030062, '서울특별시 양천구 목동로 225, 홍익병원본관 (신정동)', '홍익병원', ST_GeomFromText('POINT(126.8636640030062 37.52844147447355)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200014', '$2b$04$ho/SakbvaozJwZefqLSEhOE.bJPQjuYp1nqtacVnUybG8gqI0Pcde', '0ac63ded-4cd3-4718-bff5-38ccabe01776', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.69082165229579, 127.89490721695594, '강원특별자치도 홍천군 홍천읍 산림공원1길 17', '홍천아산병원', ST_GeomFromText('POINT(127.89490721695594 37.69082165229579)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2116761', '$2b$04$.Cdyhc5G66LfZvqADeAU/.alGipkZoxlBY6VOH.bYYApRw07FThAC', '45d3dff9-3ee3-4dd2-9988-017da150e6a2', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.19922971137399, 126.82571090454118, '경기도 화성시 남양읍 시청로160번길 46-13, 1,3~8층', '화성디에스병원', ST_GeomFromText('POINT(126.82571090454118 37.19922971137399)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2116685', '$2b$04$C6c/JC7XPGaPIG.rPnkXWu6gaxY7jG48H5ObydlRdrF7/6KV3SsJa', 'fd3b9ff9-5243-4ab1-983c-af51ba2bfcc3', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.21778332253106, 126.83265357240964, '경기도 화성시 남양읍 남양로920번길 6', '화성유일병원', ST_GeomFromText('POINT(126.83265357240964 37.21778332253106)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600048', '$2b$04$ZHwyz2/UvLxhDIJkukUWneg86SEJVgntv2qwWR2s/W9Vg7bSDDW12', 'fd8ef45f-f9bf-4933-b347-08ecd586f622', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.05595373646754, 126.98963562835073, '전라남도 화순군 화순읍 충의로 109', '화순고려병원', ST_GeomFromText('POINT(126.98963562835073 35.05595373646754)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600043', '$2b$04$K1IxIhMtaX3Wb3O7pFDgLeolZ4LwIyXXlxVfJBv4GISX/s54X1sDe', '8327d52c-9ea5-41bf-bea7-2a6e285fe870', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.05844089636795, 126.98987847235264, '전라남도 화순군 화순읍 만연로 31', '화순성심병원', ST_GeomFromText('POINT(126.98987847235264 35.05844089636795)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2600001', '$2b$04$4jBBbEsA9NozN0g.8sC1BuWNns641sKnH1OWTkoD2moJz6nC2Vu0C', '61aef334-9b18-4894-8900-8690332d4098', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.0586707410237, 127.002108292339, '전라남도 화순군 화순읍 서양로 322', '화순전남대학교병원', ST_GeomFromText('POINT(127.002108292339 35.0586707410237)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('E2200025', '$2b$04$7P95WiQoUmuEF4DGH3q06.L/U5HGxGHppEUuB1bJ7XlPu17KzCMF2', 'f88d684e-6690-418b-970f-bf230510d559', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 38.1073824571151, 127.708883438378, '강원특별자치도 화천군 화천읍 강변로 111 (화천군보건의료원)', '화천군보건의료원', ST_GeomFromText('POINT(127.708883438378 38.1073824571151)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2200016', '$2b$04$J3sP2bwW7bI7qqx6RIamjurQY6APrkOFIqq1chvep9PK5sIp0uxQO', 'eef918fd-dbc1-4890-94d2-5cc2d8d7bfa7', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.47845901170136, 127.97994775890871, '강원특별자치도 횡성군 횡성읍 횡성로 275', '횡성대성병원', ST_GeomFromText('POINT(127.97994775890871 37.47845901170136)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100015', '$2b$04$/qrjrOomY8SEOtxawgSPlutzY4AeQcP/0kcEwFDKx9PU69Blv2n8a', '76156fa6-9887-4c8e-a802-f7fb7ed86b70', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.39340413136221, 126.92447734066778, '경기도 안양시 만안구 삼덕로 9 (안양동, 안양샘병원)', '효산안양샘병원', ST_GeomFromText('POINT(126.92447734066778 37.39340413136221)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A2100054', '$2b$04$TtpdRMx.1u3tob7aq/gRe.Nb.d.Nu9uUgCHJpb5MnD3IhLpM7eDGO', '9bc53bbf-5854-4b8e-a43c-e73c62374bb6', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.35864464913468, 126.94735972779895, '경기도 군포시 군포로 591 (당동, (G샘병원)군포샘병원)', '효산지샘병원', ST_GeomFromText('POINT(126.94735972779895 37.35864464913468)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1200048', '$2b$04$sNaJoipiUcDqdOWdaxPSROibFsHyqXXc6X1OiDf1N3GOyS3W5kW.m', '3981af63-df4b-495f-8360-ffd714ec923a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 35.18541271514478, 129.12145899191526, '부산광역시 해운대구 해운대로 135 (재송동)', '효성시티병원', ST_GeomFromText('POINT(129.12145899191526 35.18541271514478)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1403132', '$2b$04$ScnFto63Jt4vsIoF/ySMi.r2O.x3PKZXCs2yzwAVmHkHo1zLV0mgO', '94d399ec-ed14-48de-b478-7054222e089a', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.959524356, 124.6654985764, '인천광역시 옹진군 백령면 백령로 831', '흑룡의원', ST_GeomFromText('POINT(124.6654985764 37.959524356)'));

INSERT INTO user (user_key, password, password_reset_key, role, created_at, updated_at) VALUES ('A1100049', '$2b$04$YwvDuD/SpT3FVUA2zCMkl.RlcnnOZnRE72eZle4wJjZqo/UBw4eny', 'd6923928-d11f-42ec-9224-4cb0448d7cbd', 'hospital', NOW(), NOW());
INSERT INTO hospital (hospital_id, latitude, longitude, address, name, location) VALUES (LAST_INSERT_ID(), 37.45567063464179, 126.90056251863875, '서울특별시 금천구 시흥대로 244 (시흥동)', '희명병원', ST_GeomFromText('POINT(126.90056251863875 37.45567063464179)'));
