var iData = null;
var iGuide = document.getElementById("iGuide");
var iGuideGroups = document.getElementById("iGuideGroups");
var iGroups = iGuideGroups.getElementsByTagName("div");
var iGuideSchools = document.getElementById("iGuideSchools");
var iGuideBtn = document.getElementById("iGuideBtn");
var iSchoolBtn = document.getElementById("iSchoolBtn");

//AJAX请求
$.ajax({
    url: "./js/data.json",
    type: "GET",
    dataType: "JSON",
    success: function(data){
        iData = data;
        for(var i = 0; i < data.length; i++){

            var iGroupItem = document.createElement("div");
            iGroupItem.className = "iGuideItem";
            iGroupItem.style.backgroundImage = "url("+data[i].icon+")";
            iGroupItem.innerText = data[i].name;
            iGroupItem.setAttribute("data-group",data[i].name)
            iGuideGroups.appendChild(iGroupItem);
            //添加学校标注点
            addSchoolMarker(data[i].school);
        }
    }
});
$(function(){
    //默认引导层的高度等于集团组的高度
    iGuide.style.height = iGuideGroups.offsetHeight + "px";
    //引导-收缩事件
    iGuideBtn.addEventListener("click",guideBtn);
    //引导-集团组点击事件
    $(".iGuideGroups").on("click",".iGuideItem",GroupClick);
    //引导-返回集团列表
    $(".iGuideSchools").on("click",".iSchoolBtn",returnGroup);

})

var markerArray = [];
function addSchoolMarker(schoolData){
    for(var i = 0; i < schoolData.length; i++){
        var pt = new BMap.Point(schoolData[i].lat, schoolData[i].lng);
        var myIcon = new BMap.Icon(schoolData[i].icon, new BMap.Size(30,30),{imageSize: new BMap.Size(30,30)});
        var marker = new BMap.Marker(pt,{icon:myIcon});  // 创建标注
        var label = new BMap.Label(schoolData[i].name,{offset: new BMap.Size(35,0)} );
        label.setStyle({ fontSize:"20px", lineHeight:"28px", background:"none",border:"none",color:"white",display:"none"})
        marker.setLabel(label);
        map.addOverlay(marker);
        markerArray.push(marker);
        addClickHandler(schoolData[i], pt, marker);
    }
}


function addClickHandler(content,pt,marker){
    marker.addEventListener("click",function(){
        openInfo(content,pt,marker);
    });
}


var infoWindow;
function openInfo(content,pt,marker){
    var modalTitleHTML = modalTitle(content);
    var modalContentHTML = modalContent(content);
    var opts = {
        width : 400,     // 信息窗口宽度
        height : 0,
        title : modalTitleHTML , // 信息窗口标题
        enableMessage:false,//设置允许信息窗发送短息
        message:""
    }
    infoWindow = new BMap.InfoWindow(modalContentHTML, opts);  // 创建信息窗口对象
    marker.openInfoWindow(infoWindow,pt); //开启信息窗口
    map.panTo(pt);
}


//初始化
var map = new BMap.Map('AllMap');

//设置视角中心点
map.centerAndZoom(new BMap.Point(120.155153,30.347163), 15);

//启用滚轮放大缩小
map.enableScrollWheelZoom();

//设置地图样式
map.setMapStyleV2({ 
    styleId: '44d85fb284e7907ae76f31be6a7847b3'
});


var bdary = new BMap.Boundary();
var name = "拱墅区";

//获取行政区域
bdary.get(name, function(rs){
    //-清楚地面覆盖物
    //map.clearOverlays();
    //-计算行政区域的点有多少个
    var count = rs.boundaries.length;
    for(var i = 0; i < count; i++){
        var ply = new BMap.Polygon(
            rs.boundaries[i],
            {
                //--设置填充颜色
                fillColor : "#000000",
                //--设置填充透明度
                fillOpacity : 0.2,
                //--设置边线的粗细
                strokeWeight : 2,
                //--设置边线的透明度 0 - 1
                strokeOpacity : 1,
                //--设置边线样式为实线或虚线，取值 solid 或 dashed
                //!dashed虚线会引起拖动地图卡顿
                strokeStyle : "solid",
                //--设置边线颜色
                strokeColor : "#df504c",    
            }
        );
        //-添加覆盖物
        map.addOverlay(ply);
    }
});

map.addEventListener("zoomend", function(){
    var zoom = map.getZoom();
    for(var i = 0; i < markerArray.length; i++){
        var marker = markerArray[i];
        var label = markerArray[i].getLabel();
        if(zoom >= 17){
            label.setStyle({ display:"block"});
        }else{
            label.setStyle({display:"none"});
        }
        //marker.setLabel(label);
    }
    
});

function modalTitle(data){
    var modalTitleHTML = '<div class="modalTitle">学校名称</div>';
    if(data.name != ""){
        modalTitleHTML = '<div class="modalTitle">'+data.name+'</div>';
    }
    return modalTitleHTML;
}
 
function modalContent(data){
    var modalContentHTML = '<div class="modalContent">';
    if(data.images != ""){
        modalContentHTML += '<div class="modalInfoTitle">学校区域图</div>'+
        '<div class="modalInfoContent"><img onload="imgLoad()" src="'+data.images+'"></div>';
    }
    if(data.rise != ""){
        modalContentHTML += '<div class="modalInfoTitle">直升小学</div>'+
        '<div class="modalInfoContent">'+data.rise+
        '</div>';
    }
    if(data.localRange  != ""){
        modalContentHTML += '<div class="modalInfoTitle">户籍儿童教育服务区</div>'+
        '<div class="modalInfoContent">'+data.localRange+'</div>';
    }
    if(data.fieldRange != ""){
        modalContentHTML += '<div class="modalInfoTitle">随迁子女教育服务区</div>'+
        '<div class="modalInfoContent">'+data.fieldRange+'</div>';
    }
    if(data.phone != ""){
        modalContentHTML += '<div class="modalInfoTitle">电话</div>'+
        '<div class="modalInfoContent">'+data.phone+'</div>';
    }
    if(data.tips != ""){
        modalContentHTML += '<div class="modalInfoTitle">温馨提示</div>'+
        '<div class="modalInfoContent">'+data.tips+'</div>';
    }
    modalContentHTML += '</div>'
    return modalContentHTML;
}

function guideBtn(){
    iGuide.classList.toggle("active");
}

function GroupClick(){
    var groupIndex = $(this).index();
    var schoolIndex = iData[groupIndex].school;
    iGuideSchools.innerHTML = "<button class='iSchoolBtn' id='iSchoolBtn'>返回集团列表</button>";
    for(var i = 0; i < schoolIndex.length; i++){
        var iSchoolItem = document.createElement("div");
        iSchoolItem.className = "iGuideItem";
        iSchoolItem.style.backgroundImage = "url("+schoolIndex[i].icon+")";
        iSchoolItem.innerText = schoolIndex[i].name;
        iSchoolItem.title = schoolIndex[i].name;
        iGuideSchools.appendChild(iSchoolItem);
        panCenter(iSchoolItem, schoolIndex[i]);
    }
    iGuide.style.height = iGuideSchools.offsetHeight + "px";
    iGuideGroups.style.bottom = iGuideSchools.offsetHeight + "px";
    iGuideGroups.style.opacity = 0;
    iGuideGroups.style.visibility = "hidden";
    iGuideSchools.style.bottom = "0px";
    iGuideSchools.style.opacity = 1;
    iGuideSchools.style.visibility = "visible";
}

function panCenter(iSchoolItem,data){
    iSchoolItem.addEventListener("click", function(){
        var point = new BMap.Point(data.lat, data.lng);
        map.setZoom(19);
        map.panTo(point);
    })
}

function returnGroup(){
    iGuide.style.height = iGuideGroups.offsetHeight + "px";
    iGuideSchools.style.bottom = -iGuideSchools.offsetHeight + "px";
    iGuideSchools.style.opacity = 0;
    iGuideSchools.style.visibility = "hidden";
    iGuideGroups.style.bottom = "0px";
    iGuideGroups.style.opacity = 1;
    iGuideGroups.style.visibility = "visible";
}
function imgLoad(){
    infoWindow.redraw();
}